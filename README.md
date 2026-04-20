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

### Day 2: Advanced Business Logic (Completed)
- Implementation of Health Score calculation logic.
- Churn Risk prediction logic based on customer behavior.
- Added support Ticket and network Device schemas.
- Enhanced API endpoints to include full customer details.

### Day 3: Frontend Foundation & Dashboard (Completed)
- Vite project initialization with Tailwind CSS.
- Implementation of Sidebar, Navigation, and Client-side Routing.
- Dashboard view with real-time metrics (Total Customers, High Churn, Avg Health).
- Interactive Usage Distribution chart using Recharts.

### Day 4: Customer Management & AI Insights (Completed)
- Implementation of advanced Customers table with search and region filtering.
- CRUD functionality: Add Customer (modal form) and Delete Customer.
- Detailed Customer view with Health Score, Support Tickets, and Device lists.
- AI Chat interface with rule-based behavioral querying.

### Day 5: Authentication, Security & Dashboard Overhaul (Completed)
- **User Authentication**: Full JWT-based login and signup system with bcrypt password hashing.
- **Protected Routes**: All API endpoints (`/api/customers`, `/api/ai/query`) secured with an `authenticate` middleware.
- **Auth Context**: Frontend `AuthContext` with `AuthProvider` for global user session management.
- **Login & Signup Pages**: Modern glassmorphism-style auth pages with animated inputs.
- **Auto-logout**: Axios response interceptor auto-redirects to login on expired/invalid tokens.
- **Churn Prediction Upgrade**: `churnRisk` upgraded from a plain string to an object with `level` and `factors` (e.g., "Low NPS Score", "Inactive for over 30 days").
- **Full CRUD**: Added `PUT /api/customers/:id` and `DELETE /api/customers/:id` (with cascading ticket/device deletion).
- **Ticket & Device Creation**: Added `POST /api/tickets` and `POST /api/devices` endpoints.
- **AI Query Fixes**: Fixed crash bug (unhandled TypeError), backward-compatible `$or` filter for mixed churnRisk formats, region regex matching, and new plan-tier filters (Enterprise, Pro, Basic).
- **Dashboard Redesign**: Replaced plain layout with gradient stat cards, area chart, donut chart, Top Performers list, and At-Risk customer panel.


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
