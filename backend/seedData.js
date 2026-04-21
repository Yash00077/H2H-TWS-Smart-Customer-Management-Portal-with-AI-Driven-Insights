require("dotenv").config();
const mongoose = require("mongoose"); 
const { faker } = require("@faker-js/faker"); 

// Connect DB 
mongoose.connect(process.env.MONGODB_URI) 
  .then(() => console.log("MongoDB Connected")) 
  .catch(err => console.log(err)); 

// Schemas 
const customerSchema = new mongoose.Schema({ 
  name: String, 
  company: String, 
  region: String, 
  planTier: String, 
  contractEndDate: Date, 
  npsScore: Number, 
  usage: Number, 
  lastActiveDays: Number, 
  healthScore: Number, 
  churnRisk: { 
    level: { type: String, default: "Low" },
    factors: [String]
  }
}); 

const ticketSchema = new mongoose.Schema({ 
  customerId: mongoose.Schema.Types.ObjectId, 
  severity: String, 
  status: String, 
  createdAt: Date 
}); 

const deviceSchema = new mongoose.Schema({ 
  customerId: mongoose.Schema.Types.ObjectId, 
  deviceType: String, 
  count: Number 
}); 

const Customer = mongoose.model("Customer", customerSchema); 
const Ticket = mongoose.model("Ticket", ticketSchema); 
const Device = mongoose.model("Device", deviceSchema); 

// Utility functions 
const regions = ["Asia", "Europe", "USA"]; 
const plans = ["Basic", "Pro", "Enterprise"]; 
const severities = ["Low", "Medium", "High"]; 
const deviceTypes = ["Router", "Switch", "Firewall"]; 

// Health Score Logic (clamped to 0-100)
function calculateHealthScore(nps, usage, lastActive, highTickets) { 
  const score = (nps * 4) + 
    (usage * 0.5) - 
    (lastActive * 1.5) - 
    (highTickets * 10); 
  return Math.max(0, Math.min(100, score));
} 

// Churn Logic — matches backend predictChurnRisk() exactly
function calculateChurn(nps, lastActive, usage) { 
  const factors = [];
  if (nps < 5) factors.push("Low NPS Score");
  if (lastActive > 30) factors.push("Inactive for over 30 days");
  if (usage < 40) factors.push("Low usage metrics");

  let level = "Low";
  if (factors.length >= 2) level = "High";
  else if (factors.length === 1) level = "Medium";

  return { level, factors };
} 

// MAIN SEED FUNCTION 
async function seedData() { 
  await Customer.deleteMany({}); 
  await Ticket.deleteMany({}); 
  await Device.deleteMany({}); 

  console.log("Old data cleared"); 

  for (let i = 0; i < 200; i++) { 
    const nps = faker.number.int({ min: 0, max: 10 }); 
    const usage = faker.number.int({ min: 10, max: 100 }); 
    const lastActive = faker.number.int({ min: 1, max: 60 }); 

    // Temporary ticket count for health calculation 
    const highTicketCount = faker.number.int({ min: 0, max: 3 }); 

    const healthScore = calculateHealthScore( 
      nps, 
      usage, 
      lastActive, 
      highTicketCount 
    ); 

    const churnRisk = calculateChurn(nps, lastActive, usage); 

    const customer = await Customer.create({ 
      name: faker.person.fullName(), 
      company: faker.company.name(), 
      region: faker.helpers.arrayElement(regions), 
      planTier: faker.helpers.arrayElement(plans), 
      contractEndDate: faker.date.future(), 
      npsScore: nps, 
      usage: usage, 
      lastActiveDays: lastActive, 
      healthScore, 
      churnRisk 
    }); 

    // Generate Tickets 
    const ticketCount = faker.number.int({ min: 2, max: 5 }); 

    for (let t = 0; t < ticketCount; t++) { 
      await Ticket.create({ 
        customerId: customer._id, 
        severity: faker.helpers.arrayElement(severities), 
        status: faker.helpers.arrayElement(["Open", "Closed"]), 
        createdAt: faker.date.recent() 
      }); 
    } 

    // Generate Devices 
    const deviceCount = faker.number.int({ min: 1, max: 3 }); 

    for (let d = 0; d < deviceCount; d++) { 
      await Device.create({ 
        customerId: customer._id, 
        deviceType: faker.helpers.arrayElement(deviceTypes), 
        count: faker.number.int({ min: 1, max: 10 }) 
      }); 
    } 
  } 

  console.log("✅ 200 Customers Seeded Successfully"); 
  mongoose.connection.close(); 
} 

// Run 
seedData(); 
