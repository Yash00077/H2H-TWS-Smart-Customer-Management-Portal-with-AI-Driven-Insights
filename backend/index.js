require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: false, // Useful if frontend uses external CDNs or APIs
}));
app.use(compression());
app.use(cors());
app.use(bodyParser.json());

// Connect DB 
mongoose.connect(process.env.MONGODB_URI) 
  .then(() => console.log("MongoDB Connected")) 
  .catch(err => console.log(err)); 

// --- Auth Schema & Middleware ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secret_key');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// --- Day 2: Added Ticket and Device Schemas ---
const ticketSchema = new mongoose.Schema({ 
  customerId: mongoose.Schema.Types.ObjectId, 
  severity: String, 
  status: String, 
  createdAt: Date 
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const deviceSchema = new mongoose.Schema({ 
  customerId: mongoose.Schema.Types.ObjectId, 
  deviceType: String, 
  count: Number 
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const customerSchema = new mongoose.Schema({ 
  name: String, 
  company: String, 
  region: String, 
  planTier: String, 
  contractEndDate: Date, 
  npsScore: Number, 
  usage: Number, 
  lastActiveDays: Number,
  healthScore: { type: Number, default: 0 },
  churnRisk: { 
    level: { type: String, default: "Low" },
    factors: [String]
  }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

customerSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

const Customer = mongoose.model("Customer", customerSchema); 
const Ticket = mongoose.model("Ticket", ticketSchema); 
const Device = mongoose.model("Device", deviceSchema); 

// --- Day 2: Business Logic Helpers ---
const calculateHealthScore = (customer, highSeverityTicketsCount) => {
  const score = (customer.npsScore * 4) + 
                (customer.usage * 0.5) - 
                (customer.lastActiveDays * 1.5) - 
                (highSeverityTicketsCount * 10);
  
  return Math.max(0, Math.min(100, score)); // Clamp between 0 and 100
};

const predictChurnRisk = (customer) => {
  const factors = [];
  let level = "Low";

  if (customer.npsScore < 5) factors.push("Low NPS Score");
  if (customer.lastActiveDays > 30) factors.push("Inactive for over 30 days");
  if (customer.usage < 40) factors.push("Low usage metrics");

  if (factors.length >= 2) {
    level = "High";
  } else if (factors.length === 1) {
    level = "Medium";
  }

  return { level, factors };
};

// --- Routes ---

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key', { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key', { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected API Routes
app.get('/api/customers', authenticate, async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Day 2: Updated POST to include calculation logic
app.post('/api/customers', authenticate, async (req, res) => {
  try {
    const { devices, ...customerData } = req.body;
    
    // For a new customer, we assume 0 high severity tickets initially
    customerData.healthScore = calculateHealthScore(customerData, 0);
    customerData.churnRisk = predictChurnRisk(customerData);

    const newCustomer = new Customer(customerData);
    await newCustomer.save();

    // Create associated devices if provided
    if (devices && Array.isArray(devices) && devices.length > 0) {
      const deviceDocs = devices.map(d => ({
        customerId: newCustomer._id,
        deviceType: d.deviceType,
        count: d.count || 1
      }));
      await Device.insertMany(deviceDocs);
    }

    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Day 2: Added Detail route with Ticket and Device info
app.get('/api/customers/:id', authenticate, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const tickets = await Ticket.find({ customerId: customer._id });
    const devices = await Device.find({ customerId: customer._id });

    // Recalculate health score based on actual high severity tickets
    const highTickets = tickets.filter(t => t.severity === 'High' && t.status === 'Open').length;
    const healthScore = calculateHealthScore(customer, highTickets);

    // Recalculate churn risk based on current metrics
    const churnRisk = predictChurnRisk(customer);

    res.json({ 
      ...customer.toJSON(), 
      tickets, 
      devices,
      healthScore, // Return the recalculated score
      churnRisk    // Return the recalculated churn risk
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add PUT route for updating customer
app.put('/api/customers/:id', authenticate, async (req, res) => {
  try {
    const customerData = req.body;
    
    // Recalculate risk if metrics changed
    customerData.churnRisk = predictChurnRisk(customerData);
    
    // We'll keep health score simple here or fetch tickets to recalculate
    const tickets = await Ticket.find({ customerId: req.params.id });
    const highTickets = tickets.filter(t => t.severity === 'High' && t.status === 'Open').length;
    customerData.healthScore = calculateHealthScore(customerData, highTickets);

    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, customerData, { new: true });
    if (!updatedCustomer) return res.status(404).json({ message: 'Customer not found' });
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add DELETE route for customer
app.delete('/api/customers/:id', authenticate, async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) return res.status(404).json({ message: 'Customer not found' });
    
    // Delete associated tickets and devices
    await Ticket.deleteMany({ customerId: req.params.id });
    await Device.deleteMany({ customerId: req.params.id });
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add POST routes for Tickets and Devices
app.post('/api/tickets', authenticate, async (req, res) => {
  try {
    const newTicket = new Ticket({ ...req.body, createdAt: new Date() });
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/devices', authenticate, async (req, res) => {
  try {
    const newDevice = new Device(req.body);
    await newDevice.save();
    res.status(201).json(newDevice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Advanced AI Query Engine ---

// Helper: extract a number from query text (e.g., "top 5", "show 10", "first 3")
const extractLimit = (q) => {
  const patterns = [
    /(?:top|first|show|give|list|display)\s+(\d+)/i,
    /(\d+)\s+(?:customers?|clients?|accounts?|results?)/i,
    /(?:limit|max)\s+(\d+)/i,
  ];
  for (const pattern of patterns) {
    const match = q.match(pattern);
    if (match) return parseInt(match[1], 10);
  }
  return null;
};

// Helper: detect sort intent from natural language
const detectSortIntent = (q) => {
  const sortPatterns = [
    // Churn / at-risk ordering
    { patterns: [/churn\s*first/i, /most\s*likely\s*to\s*churn/i, /will\s*churn/i, /highest\s*churn/i, /most\s*at[\s-]*risk/i, /riskiest/i, /most\s*risky/i], field: 'healthScore', order: 1, intent: 'churn_first' },
    { patterns: [/least\s*likely\s*to\s*churn/i, /safest/i, /most\s*stable/i, /lowest\s*churn/i, /least\s*risk/i], field: 'healthScore', order: -1, intent: 'churn_last' },

    // Health score ordering
    { patterns: [/healthiest/i, /highest\s*health/i, /best\s*health/i, /top\s*health/i, /best\s*performing/i, /top\s*perform/i, /strongest/i], field: 'healthScore', order: -1, intent: 'healthiest' },
    { patterns: [/unhealthiest/i, /lowest\s*health/i, /worst\s*health/i, /poorest\s*health/i, /worst\s*performing/i, /weakest/i, /struggling/i], field: 'healthScore', order: 1, intent: 'unhealthiest' },

    // Usage ordering
    { patterns: [/highest\s*usage/i, /most\s*active/i, /most\s*used/i, /most\s*engaged/i, /power\s*users?/i, /heavy\s*users?/i], field: 'usage', order: -1, intent: 'highest_usage' },
    { patterns: [/lowest\s*usage/i, /least\s*active/i, /least\s*used/i, /least\s*engaged/i, /underutiliz/i, /barely\s*us/i], field: 'usage', order: 1, intent: 'lowest_usage' },

    // NPS ordering
    { patterns: [/highest\s*nps/i, /best\s*nps/i, /top\s*nps/i, /happiest/i, /most\s*satisfied/i, /most\s*loyal/i], field: 'npsScore', order: -1, intent: 'highest_nps' },
    { patterns: [/lowest\s*nps/i, /worst\s*nps/i, /unhappiest/i, /least\s*satisfied/i, /most\s*dissatisfied/i, /most\s*unhappy/i], field: 'npsScore', order: 1, intent: 'lowest_nps' },

    // Inactivity ordering
    { patterns: [/most\s*inactive/i, /longest\s*inactive/i, /most\s*dormant/i, /gone\s*quiet/i, /not\s*logged\s*in/i, /haven'?t?\s*(?:been\s*)?active/i, /disappeared/i, /ghost/i], field: 'lastActiveDays', order: -1, intent: 'most_inactive' },
    { patterns: [/recently\s*active/i, /most\s*recent/i, /just\s*active/i, /newest\s*activity/i], field: 'lastActiveDays', order: 1, intent: 'recently_active' },

    // Contract ordering
    { patterns: [/contract\s*expir/i, /expiring\s*soon/i, /renew/i, /contract\s*ending/i, /about\s*to\s*expire/i, /up\s*for\s*renewal/i], field: 'contractEndDate', order: 1, intent: 'expiring_soon' },
  ];

  for (const sp of sortPatterns) {
    for (const pattern of sp.patterns) {
      if (pattern.test(q)) {
        return { field: sp.field, order: sp.order, intent: sp.intent };
      }
    }
  }
  return null;
};

// Helper: detect aggregation / stats intent
const detectAggregationIntent = (q) => {
  const aggPatterns = [
    { patterns: [/how\s*many/i, /count\s*of/i, /total\s*(?:number|count)/i, /number\s*of/i], type: 'count' },
    { patterns: [/average\s*(?:health|score)/i, /avg\s*(?:health|score)/i, /mean\s*(?:health|score)/i], type: 'avg_health' },
    { patterns: [/average\s*(?:nps|satisfaction)/i, /avg\s*nps/i, /mean\s*nps/i], type: 'avg_nps' },
    { patterns: [/average\s*usage/i, /avg\s*usage/i, /mean\s*usage/i], type: 'avg_usage' },
    { patterns: [/summary/i, /overview/i, /breakdown/i, /distribution/i, /stats/i, /statistics/i], type: 'summary' },
  ];

  for (const ap of aggPatterns) {
    for (const pattern of ap.patterns) {
      if (pattern.test(q)) return ap.type;
    }
  }
  return null;
};

// Helper: detect threshold-based filters from natural language
const detectThresholdFilters = (q) => {
  const thresholds = {};

  // Health score thresholds
  if (/health\s*(?:score\s*)?(?:below|under|less\s*than|<)\s*(\d+)/i.test(q)) {
    thresholds.healthScoreLt = parseInt(RegExp.$1, 10);
  }
  if (/health\s*(?:score\s*)?(?:above|over|more\s*than|greater\s*than|>)\s*(\d+)/i.test(q)) {
    thresholds.healthScoreGt = parseInt(RegExp.$1, 10);
  }

  // NPS thresholds
  if (/nps\s*(?:score\s*)?(?:below|under|less\s*than|<)\s*(\d+)/i.test(q)) {
    thresholds.npsLt = parseInt(RegExp.$1, 10);
  }
  if (/nps\s*(?:score\s*)?(?:above|over|more\s*than|greater\s*than|>)\s*(\d+)/i.test(q)) {
    thresholds.npsGt = parseInt(RegExp.$1, 10);
  }

  // Usage thresholds
  if (/usage\s*(?:below|under|less\s*than|<)\s*(\d+)/i.test(q)) {
    thresholds.usageLt = parseInt(RegExp.$1, 10);
  }
  if (/usage\s*(?:above|over|more\s*than|greater\s*than|>)\s*(\d+)/i.test(q)) {
    thresholds.usageGt = parseInt(RegExp.$1, 10);
  }

  // Inactivity thresholds
  if (/inactive\s*(?:for\s*)?(?:more\s*than|over|>)\s*(\d+)\s*days?/i.test(q)) {
    thresholds.inactiveDaysGt = parseInt(RegExp.$1, 10);
  }

  return thresholds;
};

// Helper: generate contextual insight for the results
const generateInsight = (results, intent) => {
  if (results.length === 0) return '';

  const avgHealth = (results.reduce((sum, c) => sum + (c.healthScore || 0), 0) / results.length).toFixed(1);
  const highRiskCount = results.filter(c => (c.churnRisk?.level || c.churnRisk) === 'High').length;
  const avgNps = (results.reduce((sum, c) => sum + (c.npsScore || 0), 0) / results.length).toFixed(1);

  const insights = [];
  if (intent === 'churn_first' || intent === 'unhealthiest') {
    insights.push(`⚠️ These customers need immediate attention.`);
    if (highRiskCount > 0) insights.push(`${highRiskCount} of them are flagged as high churn risk.`);
    insights.push(`Average health score: ${avgHealth}/100.`);
  } else if (intent === 'healthiest' || intent === 'churn_last') {
    insights.push(`✅ These are your strongest accounts.`);
    insights.push(`Average health score: ${avgHealth}/100, Average NPS: ${avgNps}/10.`);
  } else if (intent === 'expiring_soon') {
    const soonest = results[0];
    if (soonest?.contractEndDate) {
      const daysLeft = Math.ceil((new Date(soonest.contractEndDate) - new Date()) / (1000 * 60 * 60 * 24));
      insights.push(`📅 Earliest expiry is in ${daysLeft} days (${soonest.name}).`);
    }
  } else if (intent === 'most_inactive') {
    insights.push(`🔕 Average inactivity: ${(results.reduce((s, c) => s + (c.lastActiveDays || 0), 0) / results.length).toFixed(0)} days.`);
    insights.push(`Consider re-engagement campaigns for these accounts.`);
  } else {
    if (highRiskCount > 0) insights.push(`⚠️ ${highRiskCount} high-risk customer${highRiskCount > 1 ? 's' : ''} in results.`);
    insights.push(`Avg health: ${avgHealth}/100 | Avg NPS: ${avgNps}/10.`);
  }

  return insights.join(' ');
};

app.post('/api/ai/query', authenticate, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });
    
    const q = query.toLowerCase();
    let filters = {};
    let mongoFilter = {};
    let sortConfig = null;
    let limitCount = null;

    // --- 1. Extract limit (top N) ---
    limitCount = extractLimit(q);

    // --- 2. Detect sort/ranking intent ---
    const sortIntent = detectSortIntent(q);
    if (sortIntent) {
      sortConfig = { [sortIntent.field]: sortIntent.order };
      filters.sortedBy = sortIntent.intent.replace(/_/g, ' ');
    }

    // --- 3. Churn risk filter — handles both old string and new object format ---
    if (/\b(?:high)\b.*(?:churn|risk)/i.test(q) || /\b(?:churn|risk).*\b(?:high)\b/i.test(q) || q.includes('at risk') || q.includes('at-risk') || q.includes('critical')) {
      filters.churnRisk = "High";
      mongoFilter.$or = [
        { churnRisk: "High" },
        { 'churnRisk.level': "High" }
      ];
    } else if (/\b(?:medium|moderate)\b.*(?:churn|risk)/i.test(q) || /\b(?:churn|risk).*\b(?:medium|moderate)\b/i.test(q)) {
      filters.churnRisk = "Medium";
      mongoFilter.$or = [
        { churnRisk: "Medium" },
        { 'churnRisk.level': "Medium" }
      ];
    } else if (/\b(?:low)\b.*(?:churn|risk)/i.test(q) || /\b(?:churn|risk).*\b(?:low|safe)\b/i.test(q) || q.includes('no risk')) {
      filters.churnRisk = "Low";
      mongoFilter.$or = [
        { churnRisk: "Low" },
        { 'churnRisk.level': "Low" }
      ];
    }

    // --- 4. Region filter (expanded) ---
    const regionMap = [
      { keys: ['europe', 'eu ', 'european', 'uk', 'germany', 'france'], value: 'Europe', regex: 'europe' },
      { keys: ['usa', 'north america', 'america', 'united states', 'us '], value: 'USA / North America', regex: 'america|usa' },
      { keys: ['asia', 'asian', 'india', 'china', 'japan', 'apac'], value: 'Asia', regex: 'asia' },
    ];
    for (const r of regionMap) {
      if (r.keys.some(k => q.includes(k))) {
        filters.region = r.value;
        // Merge with existing $or if present
        if (mongoFilter.$or) {
          mongoFilter.$and = [
            { $or: mongoFilter.$or },
            { region: { $regex: r.regex, $options: 'i' } }
          ];
          delete mongoFilter.$or;
        } else {
          mongoFilter.region = { $regex: r.regex, $options: 'i' };
        }
        break;
      }
    }

    // --- 5. Plan tier filter ---
    if (/\benterprise\b/i.test(q)) {
      filters.planTier = "Enterprise";
      mongoFilter.planTier = { $regex: 'enterprise', $options: 'i' };
    } else if (/\bpro\b/i.test(q) && !q.includes('proble') && !q.includes('proce')) {
      filters.planTier = "Pro";
      mongoFilter.planTier = { $regex: 'pro', $options: 'i' };
    } else if (/\bbasic\b/i.test(q)) {
      filters.planTier = "Basic";
      mongoFilter.planTier = { $regex: 'basic', $options: 'i' };
    }

    // --- 6. Threshold-based filters ---
    const thresholds = detectThresholdFilters(q);
    if (thresholds.healthScoreLt !== undefined) {
      mongoFilter.healthScore = { ...(mongoFilter.healthScore || {}), $lt: thresholds.healthScoreLt };
      filters.healthScoreBelow = thresholds.healthScoreLt;
    }
    if (thresholds.healthScoreGt !== undefined) {
      mongoFilter.healthScore = { ...(mongoFilter.healthScore || {}), $gt: thresholds.healthScoreGt };
      filters.healthScoreAbove = thresholds.healthScoreGt;
    }
    if (thresholds.npsLt !== undefined) {
      mongoFilter.npsScore = { ...(mongoFilter.npsScore || {}), $lt: thresholds.npsLt };
      filters.npsBelow = thresholds.npsLt;
    }
    if (thresholds.npsGt !== undefined) {
      mongoFilter.npsScore = { ...(mongoFilter.npsScore || {}), $gt: thresholds.npsGt };
      filters.npsAbove = thresholds.npsGt;
    }
    if (thresholds.usageLt !== undefined) {
      mongoFilter.usage = { ...(mongoFilter.usage || {}), $lt: thresholds.usageLt };
      filters.usageBelow = thresholds.usageLt;
    }
    if (thresholds.usageGt !== undefined) {
      mongoFilter.usage = { ...(mongoFilter.usage || {}), $gt: thresholds.usageGt };
      filters.usageAbove = thresholds.usageGt;
    }
    if (thresholds.inactiveDaysGt !== undefined) {
      mongoFilter.lastActiveDays = { $gt: thresholds.inactiveDaysGt };
      filters.inactiveOver = `${thresholds.inactiveDaysGt} days`;
    }

    // --- 7. Contract expiry filter ---
    if (sortIntent?.intent === 'expiring_soon') {
      mongoFilter.contractEndDate = { $gte: new Date() };
      filters.contractStatus = "expiring (future only)";
    }

    // --- 8. Detect aggregation intent ---
    const aggIntent = detectAggregationIntent(q);

    // --- 9. Build and execute query ---
    let dbQuery = Customer.find(mongoFilter);
    if (sortConfig) {
      dbQuery = dbQuery.sort(sortConfig);
    }

    // Smart default: if asking "who will churn first" with no explicit risk filter, sort by health ascending
    if (sortIntent?.intent === 'churn_first' && !filters.churnRisk) {
      // Also prioritize high risk customers
      if (!mongoFilter.$or && !mongoFilter.$and) {
        mongoFilter.$or = [
          { churnRisk: "High" },
          { 'churnRisk.level': "High" },
          { churnRisk: "Medium" },
          { 'churnRisk.level': "Medium" }
        ];
        dbQuery = Customer.find(mongoFilter).sort({ healthScore: 1 });
      }
    }

    if (limitCount) {
      dbQuery = dbQuery.limit(limitCount);
      filters.limit = limitCount;
    } else if (sortIntent && !aggIntent) {
      // Smart default limit for ranked queries
      dbQuery = dbQuery.limit(20);
      filters.limit = 20;
    }

    let results = await dbQuery;

    // --- 10. Handle aggregation responses ---
    if (aggIntent) {
      const allResults = await Customer.find(mongoFilter);
      let aggSummary = '';
      let aggData = {};

      switch (aggIntent) {
        case 'count':
          aggSummary = `There are **${allResults.length}** customers matching your criteria.`;
          aggData.count = allResults.length;
          break;
        case 'avg_health':
          const avgH = allResults.length > 0 
            ? (allResults.reduce((s, c) => s + (c.healthScore || 0), 0) / allResults.length).toFixed(1) 
            : 0;
          aggSummary = `The average health score is **${avgH}/100** across ${allResults.length} customers.`;
          aggData.averageHealthScore = parseFloat(avgH);
          break;
        case 'avg_nps':
          const avgN = allResults.length > 0 
            ? (allResults.reduce((s, c) => s + (c.npsScore || 0), 0) / allResults.length).toFixed(1) 
            : 0;
          aggSummary = `The average NPS is **${avgN}/10** across ${allResults.length} customers.`;
          aggData.averageNps = parseFloat(avgN);
          break;
        case 'avg_usage':
          const avgU = allResults.length > 0 
            ? (allResults.reduce((s, c) => s + (c.usage || 0), 0) / allResults.length).toFixed(1)
            : 0;
          aggSummary = `The average usage is **${avgU}%** across ${allResults.length} customers.`;
          aggData.averageUsage = parseFloat(avgU);
          break;
        case 'summary': {
          const total = allResults.length;
          const highRisk = allResults.filter(c => (c.churnRisk?.level || c.churnRisk) === 'High').length;
          const medRisk = allResults.filter(c => (c.churnRisk?.level || c.churnRisk) === 'Medium').length;
          const lowRisk = allResults.filter(c => (c.churnRisk?.level || c.churnRisk) === 'Low').length;
          const aH = total > 0 ? (allResults.reduce((s, c) => s + (c.healthScore || 0), 0) / total).toFixed(1) : 0;
          const aN = total > 0 ? (allResults.reduce((s, c) => s + (c.npsScore || 0), 0) / total).toFixed(1) : 0;
          const aU = total > 0 ? (allResults.reduce((s, c) => s + (c.usage || 0), 0) / total).toFixed(1) : 0;
          
          aggSummary = `📊 **Customer Overview** (${total} total)\n` +
            `• 🔴 High Risk: ${highRisk} (${((highRisk/total)*100).toFixed(0)}%)\n` +
            `• 🟡 Medium Risk: ${medRisk} (${((medRisk/total)*100).toFixed(0)}%)\n` +
            `• 🟢 Low Risk: ${lowRisk} (${((lowRisk/total)*100).toFixed(0)}%)\n` +
            `• Avg Health: ${aH}/100 | Avg NPS: ${aN}/10 | Avg Usage: ${aU}%`;
          aggData = { total, highRisk, medRisk, lowRisk, avgHealth: parseFloat(aH), avgNps: parseFloat(aN), avgUsage: parseFloat(aU) };
          break;
        }
      }

      return res.json({ 
        filters, 
        results: results.length > 0 ? results : allResults.slice(0, 20), 
        summary: aggSummary, 
        aggregation: aggData,
        insight: generateInsight(allResults, sortIntent?.intent)
      });
    }

    // --- 11. Build intelligent summary ---
    let summary;
    const intent = sortIntent?.intent;

    if (results.length === 0) {
      summary = `No customers found matching your query. Try asking:\n` +
        `• "Who will churn first?"\n` +
        `• "Show unhealthiest customers"\n` +
        `• "Top 10 customers by usage"\n` +
        `• "Customers with health score below 30"\n` +
        `• "Contracts expiring soon"\n` +
        `• "Give me a summary"`;
    } else {
      const countText = `Found **${results.length}** customer${results.length > 1 ? 's' : ''}`;
      
      const intentDescriptions = {
        'churn_first': 'most likely to churn (sorted by lowest health score)',
        'churn_last': 'least likely to churn (sorted by highest health score)',
        'healthiest': 'with the best health scores',
        'unhealthiest': 'with the worst health scores',
        'highest_usage': 'with the highest usage',
        'lowest_usage': 'with the lowest usage',
        'highest_nps': 'with the highest NPS (most satisfied)',
        'lowest_nps': 'with the lowest NPS (most dissatisfied)',
        'most_inactive': 'who have been inactive the longest',
        'recently_active': 'who were most recently active',
        'expiring_soon': 'with contracts expiring soonest',
      };

      const intentDesc = intentDescriptions[intent];
      summary = intentDesc 
        ? `${countText} ${intentDesc}.`
        : `${countText} matching your request.`;
    }

    const insight = generateInsight(results, intent);

    res.json({ filters, results, summary, insight });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Production Setup & Error Handling ---
// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Any route that is not API will be handled by React
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
