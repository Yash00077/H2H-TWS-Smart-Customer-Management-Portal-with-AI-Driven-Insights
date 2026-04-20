require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

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
    const customerData = req.body;
    
    // For a new customer, we assume 0 high severity tickets initially
    customerData.healthScore = calculateHealthScore(customerData, 0);
    customerData.churnRisk = predictChurnRisk(customerData);

    const newCustomer = new Customer(customerData);
    await newCustomer.save();
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

    res.json({ 
      ...customer.toJSON(), 
      tickets, 
      devices,
      healthScore // Return the calculated score
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

// --- AI Query Endpoint ---
app.post('/api/ai/query', authenticate, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });
    
    const lowercaseQuery = query.toLowerCase();
    let filters = {};
    let mongoFilter = {};

    // Churn risk filter — handles both old string and new object format in DB
    if (lowercaseQuery.includes('high churn risk') || lowercaseQuery.includes('high risk')) {
      filters.churnRisk = "High";
      mongoFilter.$or = [
        { churnRisk: "High" },
        { 'churnRisk.level': "High" }
      ];
    } else if (lowercaseQuery.includes('medium churn risk') || lowercaseQuery.includes('medium risk')) {
      filters.churnRisk = "Medium";
      mongoFilter.$or = [
        { churnRisk: "Medium" },
        { 'churnRisk.level': "Medium" }
      ];
    } else if (lowercaseQuery.includes('low churn risk') || lowercaseQuery.includes('low risk')) {
      filters.churnRisk = "Low";
      mongoFilter.$or = [
        { churnRisk: "Low" },
        { 'churnRisk.level': "Low" }
      ];
    }

    // Region filter
    if (lowercaseQuery.includes('europe')) {
      filters.region = "Europe";
      mongoFilter.region = { $regex: 'europe', $options: 'i' };
    } else if (lowercaseQuery.includes('usa') || lowercaseQuery.includes('north america') || lowercaseQuery.includes('america')) {
      filters.region = "USA / North America";
      mongoFilter.region = { $regex: 'america|usa', $options: 'i' };
    } else if (lowercaseQuery.includes('asia')) {
      filters.region = "Asia";
      mongoFilter.region = { $regex: 'asia', $options: 'i' };
    }

    // Plan tier filter
    if (lowercaseQuery.includes('enterprise')) {
      filters.planTier = "Enterprise";
      mongoFilter.planTier = { $regex: 'enterprise', $options: 'i' };
    } else if (lowercaseQuery.includes('pro')) {
      filters.planTier = "Pro";
      mongoFilter.planTier = { $regex: 'pro', $options: 'i' };
    } else if (lowercaseQuery.includes('basic')) {
      filters.planTier = "Basic";
      mongoFilter.planTier = { $regex: 'basic', $options: 'i' };
    }

    const results = await Customer.find(mongoFilter);
    
    // Build a natural language summary
    let summary;
    if (results.length === 0) {
      summary = `No customers found matching your query. Try asking about churn risk, region, or plan tier.`;
    } else {
      summary = `Found ${results.length} customer${results.length > 1 ? 's' : ''} matching your request.`;
    }

    res.json({ filters, results, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
