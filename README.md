# Smart Customer Management Portal

A full-stack web application designed to manage customers and provide AI-driven insights including health scores and churn risk analysis.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide-React
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose
- **AI**: Rule-based AI insights for customer behavior analysis

## Project Roadmap (7-Day Sprint)

### Day 1: Foundation & Backend Core (Current)
- Initial project structure setup.
- Express server configuration.
- MongoDB Atlas integration with Mongoose.
- Customer schema and basic API endpoints.

### Day 2: Advanced Business Logic
- Implementation of Health Score calculation.
- Churn Risk prediction logic.
- Support tickets and device tracking models.

### Day 3: Frontend Setup & Layout
- Vite project initialization.
- Tailwind CSS configuration.
- Global layout (Sidebar, Navigation) and Routing.

### Day 4: Dashboard & Data Visualization
- Implementation of the Dashboard view.
- Real-time metrics and usage distribution charts using Recharts.

### Day 5: Customer Management
- Advanced customer table with search and filtering.
- CRUD operations (Add, Delete, View Details).

### Day 6: AI Insights & Chat
- Rule-based AI Query endpoint.
- Interactive AI Chat interface.

### Day 7: Final Polishing & Documentation
- UI/UX refinements.
- Final testing and bug fixes.
- Comprehensive documentation.

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
