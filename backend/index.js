require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect DB 
mongoose.connect(process.env.MONGODB_URI) 
  .then(() => console.log("MongoDB Connected")) 
  .catch(err => console.log(err)); 

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
  churnRisk: { type: String, default: "Low" }
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
  if (customer.npsScore < 5 && customer.lastActiveDays > 30 && customer.usage < 40) {
    return "High";
  } else if (customer.npsScore < 7) {
    return "Medium";
  } else {
    return "Low";
  }
};

// --- Routes ---

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Day 2: Updated POST to include calculation logic
app.post('/api/customers', async (req, res) => {
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
app.get('/api/customers/:id', async (req, res) => {
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

// --- Day 6: AI Query Endpoint ---
app.post('/api/ai/query', async (req, res) => {
  const { query } = req.body;
  const lowercaseQuery = query.toLowerCase();
  
  let filters = {};
  let mongoFilter = {};

  if (lowercaseQuery.includes('high churn risk')) {
    filters.churnRisk = "High";
    mongoFilter.churnRisk = "High";
  } else if (lowercaseQuery.includes('medium churn risk')) {
    filters.churnRisk = "Medium";
    mongoFilter.churnRisk = "Medium";
  } else if (lowercaseQuery.includes('low churn risk')) {
    filters.churnRisk = "Low";
    mongoFilter.churnRisk = "Low";
  }

  if (lowercaseQuery.includes('europe')) {
    filters.region = "Europe";
    mongoFilter.region = "Europe";
  } else if (lowercaseQuery.includes('usa')) {
    filters.region = "USA";
    mongoFilter.region = "USA";
  } else if (lowercaseQuery.includes('asia')) {
    filters.region = "Asia";
    mongoFilter.region = "Asia";
  }

  try {
    const results = await Customer.find(mongoFilter);
    res.json({ filters, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
