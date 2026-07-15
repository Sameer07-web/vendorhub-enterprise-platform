# VendorHub Enterprise Platform

VendorHub is a mature, high-performance Enterprise Procurement Management Platform built on the MERN stack. Designed specifically for scale, VendorHub accelerates approval workflows, mitigates compliance risk, and provides real-time visibility into organizational spend. 

This repository houses the frontend and backend microservices driving the VendorHub experience, delivering a unified, accessible, and deeply responsive interface built on modern React and Tailwind CSS.

---

## 🌟 Key Features

### 1. Enterprise Procurement Workflows
- **Purchase Requests (PR)**: Create, track, and approve PRs with multi-stage, role-based routing.
- **RFQ Management**: Manage Request for Quotation cycles seamlessly.
- **Vendor Management**: Centralized repository for vendor onboarding, risk assessment, and compliance tracking.

### 2. High-Performance Architecture
- **Global Command Palette**: Instantly search Vendors, PRs, and RFQs from anywhere via `Ctrl+K`.
- **Dynamic Theming Ecosystem**: Deeply integrated Light, Dark, and System theme persistence leveraging Tailwind CSS variables for zero-latency switching without layout shifts.
- **Notification Center**: Real-time alerts for approvals, expirations, and system maintenance.

### 3. Institutional Polish
- **Accessibility (a11y)**: Semantic HTML, strict ARIA labeling, extensive keyboard navigability, and WCAG AA contrast compliance.
- **Responsive Layouts**: Flawless scaling from 4K desktop environments down to mobile devices.
- **Unified Design System**: A strict adherence to an internal design token system ensuring visual consistency across all forms, tables, and dialogs.

---

## 🏗️ Architecture & Technology Stack

The platform is engineered using modern, industry-standard technologies to ensure long-term maintainability.

- **Frontend**: React 18, Vite, React Router v6
- **Styling**: Tailwind CSS v4 (Custom Design System, CSS Variables)
- **Icons**: Lucide React
- **Toast Notifications**: React Hot Toast
- **Backend (API)**: Node.js, Express (RESTful Architecture)
- **Database**: MongoDB (Mongoose ODM)

---

## 📂 Folder Structure

```text
vendorhub-enterprise-platform/
├── client/                     # React Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Axios interceptors and route controllers
│   │   ├── components/         # Reusable atomic UI (Buttons, Inputs, Cards)
│   │   ├── context/            # React Contexts (ThemeContext)
│   │   ├── features/           # Domain-driven modules (Auth, Vendors, PRs)
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── utils/              # Helper functions (Formatting, Auth checks)
│   │   ├── App.jsx             # Root Router & Layout Provider
│   │   └── index.css           # Tailwind directives & CSS Theme Variables
│   ├── tailwind.config.js      # Design system token definitions
│   └── vite.config.js          # Build configuration
└── server/                     # Node.js API (if included in deployment)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/vendorhub-enterprise-platform.git
   cd vendorhub-enterprise-platform
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Install Backend Dependencies (if applicable):**
   ```bash
   cd ../server
   npm install
   ```

### Environment Variables

Create a `.env` file in the `client/` directory with the following variables:

```env
# API Endpoint URL
VITE_API_URL=http://localhost:5000/api

# Demo Account Credentials (for the "Try Demo" feature)
VITE_DEMO_EMAIL=demo@vendorhub.app
VITE_DEMO_PASSWORD=enterprise_secure_123
```

### Running Locally

To start the frontend development server:
```bash
npm run dev
```
Navigate to `http://localhost:5173`.

To start the backend server (ensure MongoDB is running):
```bash
cd server
npm start
```

---

## 🚢 Deployment

The frontend is optimized for deployment on Vercel, Netlify, or AWS Amplify.

### Production Build
```bash
npm run build
```
This generates a highly optimized, minified `dist` directory (typically under 150kb gzipped) ready to be served statically. 

**Deployment Checklist:**
- [ ] Ensure `VITE_API_URL` points to the production backend endpoint.
- [ ] Ensure URL rewrite rules are configured for SPA routing (redirect all traffic to `index.html`).
- [ ] Ensure SSL/TLS is active for secure authentication.

---

## 🛣️ Future Roadmap

- [ ] **Data Visualization**: Integrate Recharts for real-time spend analytics on the Executive Dashboard.
- [ ] **WebSockets**: Implement Socket.io for live Notification Center updates without polling.
- [ ] **Role-Based Access Control (RBAC)**: Expand frontend route protection to explicitly check granular permissions (Viewer, Contributor, Admin).
- [ ] **Localization (i18n)**: Prepare the UI strings for multi-language support.

---

*VendorHub Enterprise Platform — Built for scale, designed for humans.*
