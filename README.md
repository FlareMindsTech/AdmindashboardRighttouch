# RightTouch Admin Dashboard

> A comprehensive, real-time enterprise operations and business management platform built for **RightTouch** by **FlareMinds Tech Pvt Ltd**.

---

## 📌 Overview

The **RightTouch Admin Dashboard** provides business owners and system administrators with a unified control center for on-demand home and facility services and e-commerce product lines. It offers real-time business analytics, service dispatch operations, technician management, commission tracking, geofenced city zoning, and financial reconciliation.

---

## 🚀 Key Modules & Features

### 1. 📊 Executive Business Dashboard
- **Unified KPIs**: Real-time tracking of Total Revenue, Total Bookings, Paid Bookings, Active Categories, and Active Catalog Items.
- **Revenue & Booking Trends**: Interactive 6-month dual-series charts powered by ApexCharts for service and product revenue streams.
- **Revenue Mix & Category Insights**: Real-time breakdown of service vs. product revenue share and top-performing categories.
- **Recent Bookings Feed**: Live activity stream showing customer orders, service status, and payment states.

### 2. 📦 Product & Inventory Management
- Product catalog management with SKU tracking, categorization, and pricing.
- Quotation requests, purchase orders, and inventory audit logs.
- Product performance metrics and customer demand insights.

### 3. 🛠️ Service Management
- Multi-tier service catalog (categories, sub-categories, service packages).
- Dynamic pricing, labor estimation, and service zone assignment.
- Service demand forecasting and revenue analysis.

### 4. 👷 Technician Management
- End-to-end technician onboarding, document verification, and KYC tracking.
- Skill tagging, operational status, and real-time job allocation.
- Performance ratings, job completion rates, and dispute logs.

### 5. 📍 City Zones & Geofencing (GIS)
- Interactive Leaflet-powered maps for city boundary and operational zone mapping.
- Polygon geofencing for service availability and automated booking routing.
- Demand heatmaps and technician coverage density.

### 6. 💳 Technician Payouts & Finance
- Technician digital wallet tracking with real-time balance calculations.
- Withdrawal request review, approval workflows, and automated transaction logs.
- Dynamic commission rules, payout batching, and payment reconciliation.

### 7. 👥 User Management
- Centralized customer profiles, booking histories, and payment logs.
- Account status controls, customer support notes, and lifetime value tracking.

### 8. ⭐ Reports, Ratings & Dispatch Ops
- Customer review moderation and technician rating distribution.
- Live dispatch operations monitor with job dispatch queues and status trackers.
- Comprehensive financial and operational reports with PDF export capabilities.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 17](https://reactjs.org/)
- **UI & Design System**: [Chakra UI](https://chakra-ui.com/), Emotion, Framer Motion
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/), React-Redux
- **Data Visualization**: [ApexCharts](https://apexcharts.com/) / `react-apexcharts`, [Chart.js](https://www.chartjs.org/)
- **Maps & GIS**: [Leaflet](https://leafletjs.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: React Icons (FontAwesome, Feather, Material Design)
- **PDF & Reports**: jsPDF, jsPDF-AutoTable

---

## 📁 Project Structure

```
AdmindashboardRighttouch/
├── public/                  # Static assets & HTML template
├── src/
│   ├── api/                 # API client configurations & endpoints
│   ├── assets/              # Logos, theme images, and graphics
│   ├── components/          # Reusable component library
│   │   ├── Card/            # Card primitives
│   │   ├── common/          # Shared components (DataTable, Modals, Badges)
│   │   ├── Dashboard/       # Dashboard widgets (KpiTile, Trend cards)
│   │   ├── Layout/          # Main panel and layout containers
│   │   ├── Map/             # Leaflet GIS and zone mapping components
│   │   ├── Navbars/         # Top navbar and navigation links
│   │   ├── Sidebar/         # Responsive sidebar navigation
│   │   └── TechnicianPayouts/# Wallet & payout management components
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Route layout wrappers (Admin, Auth)
│   ├── store/               # Redux Toolkit store & feature slices
│   │   └── slices/          # authSlice, bookingsSlice, usersSlice, etc.
│   ├── theme/               # Chakra UI customized design tokens
│   ├── views/               # Page views & feature modules
│   │   ├── Dashboard/       # Main operational screens
│   │   └── Pages/           # Authentication and utility pages
│   ├── index.js             # Application entry point
│   └── routes.js            # Central routing configuration
├── .env                     # Environment variables configuration
└── package.json             # Dependencies and build scripts
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js**: `v16` to `v20` (Node `v18 LTS` recommended)
- **npm**: `v8` or newer

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd AdmindashboardRighttouch
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**:
   Create or verify the `.env` file in the root directory:
   ```env
   PUBLIC_URL=/
   REACT_APP_API_BASE_URL=http://localhost:7372
   ```

---

## 💻 Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm start` | Runs the app in development mode at [http://localhost:3000](http://localhost:3000) with hot-reloading. |
| `npm run build` | Builds the production-ready bundle into the `build/` directory. |
| `npm run lint:check` | Runs ESLint across all JavaScript/JSX files to check for code issues. |
| `npm run lint:fix` | Runs ESLint and automatically fixes fixable formatting and lint issues. |
| `npm test` | Launches the test runner in interactive watch mode. |
| `npm run install:clean` | Performs a clean reinstall of `node_modules` and restarts development server. |

---

## 🔐 Role-Based Access Control

The platform enforces strict role gating:
- **Owner**: Full access to financial metrics, commission controls, payouts, and administration.
- **Admin**: Operational access restricted to assigned management tasks (dispatch, user verification, job assignment).

---

## 🏢 Organization & Support

Developed and maintained by **FlareMinds Tech PVT LTD** for **RightTouch**.
For technical inquiries, contact the development team at [support@flareminds.com](mailto:support@flareminds.com).
