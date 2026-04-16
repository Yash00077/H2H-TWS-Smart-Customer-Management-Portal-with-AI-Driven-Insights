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

// Basic Routes 
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
