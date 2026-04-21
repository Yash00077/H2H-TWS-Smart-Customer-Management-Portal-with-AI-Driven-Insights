<div align="center">

# 🧠 Smart Customer Management Portal

### AI-Driven Customer Intelligence Platform

**Health Scores · Churn Prediction · Actionable Insights · Natural-Language Queries**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](https://opensource.org/licenses/ISC)

<br/>

A production-ready, full-stack web application for managing customer relationships with **AI-powered behavioral analysis**. The platform delivers real-time health scores, multi-factor churn prediction, and a natural-language query engine — enabling customer success teams to proactively identify at-risk accounts and take data-driven action.

<br/>

[Getting Started](#-getting-started) · [Features](#-key-features) · [Architecture](#-architecture) · [API Reference](#-api-reference) · [Roadmap](#-project-roadmap)

---

</div>

<br/>

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Business Logic](#-business-logic)
- [Project Roadmap](#-project-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

<br/>

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 📊 Interactive Dashboard
Real-time metrics with gradient stat cards, area charts, donut charts, a top performers leaderboard, and an at-risk customer panel — all dynamically rendered from live data.

</td>
<td width="50%">

### 🔍 Customer Management
Full CRUD operations with advanced search, multi-region filtering, detailed customer profiles with health scores, and cascading delete across related entities.

</td>
</tr>
<tr>
<td width="50%">

### 🤖 AI Insights Engine
Natural-language query interface — ask questions like _"Show high risk customers in Asia"_ and get instant, filtered results with human-readable summaries.

</td>
<td width="50%">

### 🔐 Secure Authentication
JWT-based login & signup with bcrypt password hashing (10 salt rounds), protected API routes, token-based session management, and automatic logout on token expiry.

</td>
</tr>
<tr>
<td width="50%">

### 📈 Health Score Engine
Algorithmic scoring (0–100) computed from NPS, usage metrics, activity recency, and open ticket severity — recalculated in real-time on every detail view.

</td>
<td width="50%">

### ⚠️ Churn Prediction
Multi-factor risk classification (Low / Medium / High) with transparent, human-readable risk factors so teams know exactly _why_ a customer is at risk.

</td>
</tr>
<tr>
<td width="50%">

### 🎫 Ticket & Device Tracking
Support ticket severity tracking (Open/Closed, Low/Medium/High) and network device inventory per customer for complete account visibility.

</td>
<td width="50%">

### 🌱 Seed Data Generator
Faker.js-powered script to populate 200 realistic customers complete with randomized tickets, devices, NPS scores, and usage patterns for instant demo readiness.

</td>
</tr>
</table>

<br/>

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| [React](https://react.dev/) | 18.2 | Component-based UI with hooks & context API |
| [Vite](https://vitejs.dev/) | 5.0 | Lightning-fast HMR, dev server & optimized builds |
| [Tailwind CSS](https://tailwindcss.com/) | 3.3 | Utility-first styling with custom gradients & glassmorphism |
| [Recharts](https://recharts.org/) | 2.10 | Composable area charts, bar charts & donut charts |
| [React Router](https://reactrouter.com/) | 6.20 | Client-side routing with protected route guards |
| [Axios](https://axios-http.com/) | 1.6 | HTTP client with response interceptors for auth |
| [Lucide React](https://lucide.dev/) | 0.294 | Modern, consistent icon system |

### Backend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| [Node.js](https://nodejs.org/) | 18+ | JavaScript runtime |
| [Express](https://expressjs.com/) | 5.2 | RESTful API server with middleware pipeline |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud | Fully managed NoSQL database |
| [Mongoose](https://mongoosejs.com/) | 9.4 | ODM with schema validation & virtuals |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3.0 | Password hashing with configurable salt rounds |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9.0 | JWT signing & verification (7-day expiry) |
| [Faker.js](https://fakerjs.dev/) | 10.4 | Realistic test data generation |

### AI / Intelligence Layer

| Component | Description |
|:----------|:------------|
| **Rule-Based NLP Engine** | Parses natural-language queries to extract intent (churn risk, region, plan tier) |
| **Health Score Algorithm** | Weighted formula combining NPS, usage, inactivity, and ticket severity |
| **Churn Risk Classifier** | Multi-factor risk assessment with transparent factor reporting |

<br/>

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND  (React + Vite)                 │
│                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐  │
│  │ Dashboard │  │ Customers │  │ Customer  │  │ AI Chat  │  │
│  │  (Stats,  │  │  (Table,  │  │  Detail   │  │ (Query,  │  │
│  │  Charts)  │  │   CRUD)   │  │ (Profile) │  │ Results) │  │
│  └─────┬─────┘  └──────┬────┘  └──────┬────┘  └─────┬────┘  │
│        └───────────────┴──────────────┴─────────────┴       │
│                          │ Axios                            │
│               ┌──────────┴──────────┐                       │
│               │  AuthContext (JWT)  │                       │
│               └──────────┬──────────┘                       │
└──────────────────────────┼──────────────────────────────────┘
                           │ REST API (JSON)
┌──────────────────────────┼──────────────────────────────────┐
│                   BACKEND  (Express 5)                      │
│               ┌──────────┴──────────┐                       │
│               │  Auth Middleware    │                       │
│               │  (JWT Verification) │                       │
│               └──────────┬──────────┘                       │
│    ┌──────────┬──────────┼──────────┬──────────┐            │
│    │ /auth    │/customers│/customers│/ai/query │            │
│    │ register │ GET, POST│  /:id    │  POST    │            │
│    │ login    │          │PUT, DEL  │          │            │
│    └────┬─────┴────┬─────┴────┬─────┴────┬─────┘            │
│         │    ┌─────┴─────┐    │    ┌─────┴─────┐            │
│         │    │  Health   │    │    │ AI Query  │            │
│         │    │  Score    │    │    │  Engine   │            │
│         │    │  Engine   │    │    │ (NLP →    │            │
│         │    └───────────┘    │    │ Mongo     │            │
│         │                     │    │ Filter)   │            │
│         └─────────┬───────────┘    └───────────┘            │
│                   │ Mongoose ODM                            │
└───────────────────┼─────────────────────────────────────────┘
                    │
          ┌─────────┴─────────┐
          │   MongoDB Atlas   │
          │                   │
          │  ┌──────┐ ┌─────┐ │
          │  │Users │ │Cust-│ │
          │  └──────┘ │omers│ │
          │  ┌──────┐ └─────┘ │
          │  │Tick- │ ┌─────┐ │
          │  │ets   │ │Devi-│ │
          │  └──────┘ │ces  │ │
          │           └─────┘ │
          └───────────────────┘
```

<br/>

## 📁 Project Structure

```
Smart Customer ManagementPortal/
│
├── backend/
│   ├── index.js                # Express server — schemas, routes, auth & AI logic
│   ├── seedData.js             # Faker.js script to seed 200 customers + tickets + devices
│   ├── .env                    # MONGODB_URI, PORT, JWT_SECRET (not committed)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       # Axios instance with auth interceptor & base URL
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx  # Auth guard — redirects unauthenticated users
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state (login, logout, token persistence)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Stat cards, area chart, donut chart, top/at-risk lists
│   │   │   ├── Customers.jsx       # Searchable table, add/delete modals, region filter
│   │   │   ├── CustomerDetail.jsx  # Full profile, tickets, devices, live health score
│   │   │   ├── AIChat.jsx          # Chat interface with results table
│   │   │   ├── Login.jsx           # Glassmorphism login page with animated inputs
│   │   │   └── Signup.jsx          # Glassmorphism signup page with validation
│   │   ├── App.jsx             # Root layout — routing, sidebar, header
│   │   ├── main.jsx            # Entry point — BrowserRouter & AuthProvider
│   │   └── index.css           # Tailwind directives & global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

<br/>

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Link |
|:------------|:--------|:-----|
| **Node.js** | v18 or higher | [Download →](https://nodejs.org/) |
| **npm** | v9 or higher | Included with Node.js |
| **MongoDB Atlas** | Free tier (M0) | [Create Cluster →](https://www.mongodb.com/cloud/atlas) |
| **Git** | Latest | [Download →](https://git-scm.com/) |

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/Yash00077/H2H-TWS-Smart-Customer-Management-Portal-with-AI-Driven-Insights.git
cd H2H-TWS-Smart-Customer-Management-Portal-with-AI-Driven-Insights
```

#### 2. Configure environment variables

Create a `.env` file inside the `backend/` directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/customerDB?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

> **🔒 Security Note:** Use a strong, random string for `JWT_SECRET` in production. Never commit `.env` files to version control.

#### 3. Install dependencies

```bash
# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install
```

#### 4. Seed the database *(optional)*

Generate 200 realistic customer records with associated tickets and devices:

```bash
cd backend
node seedData.js
```

> This creates demo data using Faker.js — ideal for testing, demos, and development.

#### 5. Start the development servers

Open two terminal windows:

```bash
# Terminal 1 → Backend API (http://localhost:5000)
cd backend
node index.js

# Terminal 2 → Frontend Dev Server (http://localhost:5173)
cd frontend
npm run dev
```

Once both servers are running, open **http://localhost:5173** in your browser.

<br/>

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|:---------|:--------:|:-------:|:------------|
| `MONGODB_URI` | ✅ | — | MongoDB Atlas connection string |
| `PORT` | ❌ | `5000` | Port for the Express API server |
| `JWT_SECRET` | ✅ | — | Secret key used to sign & verify JWT tokens |

<br/>

## 🔌 API Reference

> **Base URL:** `http://localhost:5000/api`
>
> All endpoints except authentication require an `Authorization: Bearer <token>` header.

### 🔑 Authentication

<details>
<summary><code>POST</code> <code>/api/auth/register</code> — Create a new user account</summary>

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Success Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "663f1a2b...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response:** `400 Bad Request` — User already exists
</details>

<details>
<summary><code>POST</code> <code>/api/auth/login</code> — Authenticate an existing user</summary>

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Success Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "663f1a2b...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response:** `400 Bad Request` — Invalid credentials
</details>

### 👥 Customers

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/customers` | Retrieve all customers |
| `POST` | `/api/customers` | Create customer *(auto-calculates health score & churn risk)* |
| `GET` | `/api/customers/:id` | Get customer details + tickets + devices *(recalculates health score)* |
| `PUT` | `/api/customers/:id` | Update customer *(recalculates churn risk & health score)* |
| `DELETE` | `/api/customers/:id` | Delete customer + cascade delete associated tickets & devices |

### 🎫 Support & Devices

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/tickets` | Create a support ticket for a customer |
| `POST` | `/api/devices` | Register a network device for a customer |

### 🤖 AI Query

<details>
<summary><code>POST</code> <code>/api/ai/query</code> — Natural-language customer search</summary>

**Request Body:**
```json
{
  "query": "Show high risk customers in Asia"
}
```

**Success Response:** `200 OK`
```json
{
  "filters": {
    "churnRisk": "High",
    "region": "Asia"
  },
  "results": [ /* array of matching customer objects */ ],
  "summary": "Found 12 customers matching your request."
}
```

**Supported Query Patterns:**

| Category | Example Queries |
|:---------|:----------------|
| Churn Risk | `"Show high risk customers"`, `"Low churn risk"` |
| Region | `"Customers in Europe"`, `"Asia region"` |
| Plan Tier | `"Enterprise plan customers"`, `"Show Pro users"` |
| Combined | `"High risk customers in Asia with Enterprise plan"` |

</details>

<br/>

## 🧮 Business Logic

### Health Score Calculation

The health score is a composite metric (0–100) computed using the following weighted formula:

```
Health Score = (NPS × 4) + (Usage × 0.5) − (DaysInactive × 1.5) − (HighSeverityOpenTickets × 10)
```

| Component | Weight | Impact |
|:----------|:-------|:-------|
| NPS Score | × 4 | Higher NPS → Higher score |
| Usage Metrics | × 0.5 | Higher usage → Higher score |
| Days Inactive | × 1.5 | More inactivity → Lower score |
| High Severity Open Tickets | × 10 | More critical tickets → Lower score |

> The score is clamped to **0–100** and recalculated in real-time on every customer detail view using live ticket data.

### Churn Risk Prediction

The churn classifier evaluates three behavioral signals and assigns a risk level:

| Factor | Trigger Condition |
|:-------|:------------------|
| Low NPS Score | `npsScore < 5` |
| Inactivity | `lastActiveDays > 30` |
| Low Usage | `usage < 40` |

| Risk Level | Condition | Interpretation |
|:-----------|:----------|:---------------|
| 🔴 **High** | 2+ factors triggered | Immediate intervention recommended |
| 🟡 **Medium** | Exactly 1 factor triggered | Monitor closely, proactive outreach advised |
| 🟢 **Low** | No factors triggered | Healthy engagement — continue nurturing |

> Each prediction includes a `factors` array with human-readable explanations (e.g., _"Low NPS Score"_, _"Inactive for over 30 days"_), enabling transparent, actionable follow-up.

<br/>

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

### Day 6: Advanced AI Engine, Logic Audit & Documentation (Completed)
- **Advanced AI Query Engine**: Complete rewrite of the `/api/ai/query` endpoint with a multi-layered NLP pipeline:
  - **Intent Detection**: Understands natural prompts like "Who will churn first?", "Show unhealthiest customers", "Most inactive accounts", "Contracts expiring soon".
  - **Smart Sorting & Ranking**: Auto-sorts results by health score, NPS, usage, inactivity, or contract date based on detected intent.
  - **Top-N Extraction**: Parses "top 5", "first 10", "show 3 customers" from queries.
  - **Threshold Filters**: Supports "health score below 30", "NPS above 8", "usage under 40", "inactive for more than 45 days".
  - **Aggregation Queries**: Handles "how many high risk customers?", "average health score", "give me a summary/overview" with statistical breakdowns.
  - **Contextual Insights**: Every response includes AI-generated insights (e.g., "⚠️ 12 flagged as high churn risk. Average health: 23.4/100").
  - **Expanded Filters**: Region detection now recognizes "EU", "APAC", "India", "UK", etc. Plan tier uses word-boundary matching.
- **AI Chat UI Overhaul**: Redesigned frontend chat component with:
  - Clickable suggested prompt buttons for discoverability.
  - Insight banners below bot messages.
  - Markdown bold rendering in summaries.
  - Enhanced results table with health score progress bars, NPS scores, usage percentages, and churn risk factor tooltips.
  - Auto-scroll to latest message.
- **Business Logic Audit & Fixes**:
  - **Seed Data Churn Logic Fixed**: Aligned `seedData.js` churn algorithm with backend's factor-counting system (was using a completely different formula).
  - **Seed Data Schema Fixed**: `churnRisk` now stored as `{ level, factors }` object instead of a plain string — risk factors now visible across the app.
  - **Health Score Clamping**: Added `Math.max(0, Math.min(100, ...))` to seed data (was allowing negative values).
  - **Detail Route Fix**: `GET /customers/:id` now recalculates both health score AND churn risk (was only recalculating health score).
- **README Overhaul**: Complete rewrite to industry-level documentation with badges, table of contents, architecture diagrams, expandable API reference, and comprehensive business logic documentation.

<br/>

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes with a descriptive message
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request with a detailed description of your changes

> Please ensure your code follows the existing style conventions and includes appropriate documentation.

<br/>

## 📄 License

This project is licensed under the **[ISC License](https://opensource.org/licenses/ISC)**.

---

<div align="center">

**Built with ❤️ for smarter customer management**

<br/>

<sub>If you found this project helpful, consider giving it a ⭐</sub>

</div>
