# Smart Customer Management Portal

A full-stack web application designed to manage customers and provide AI-driven insights including health scores and churn risk analysis.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide-React
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose
- **AI**: Rule-based AI insights for customer behavior analysis

## Project Roadmap 

### Day 1: Foundation & Backend Core (Completed)
- Initial project structure setup.
- Express server configuration.
- MongoDB Atlas integration with Mongoose.
- Customer schema and basic API endpoints.

### Day 2: Advanced Business Logic (Current)
- Implementation of Health Score calculation logic.
- Churn Risk prediction logic based on customer behavior.
- Added support Ticket and network Device schemas.
- Enhanced API endpoints to include full customer details.


## Getting Started

### Prerequisites
- Node.js installed
- MongoDB Atlas account

### Installation
1. Clone the repository.
2. Setup `.env` in the `backend/` directory with your `MONGODB_URI`.
3. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Run the servers:
   ```bash
   # In backend/
   node index.js
   # In frontend/
   npm run dev
   ```
