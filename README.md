# 🚀 VendorHub Enterprise Platform

<p align="center">
  <h3 align="center">Enterprise Multi-Tenant AI-Powered Procurement & Workflow Management SaaS Platform</h3>

  <p align="center">
    Production-grade MERN application built using Clean Architecture, Repository Pattern, Dynamic RBAC, AI Copilot, Workflow Automation, Analytics, Enterprise Search and Multi-Tenant SaaS Architecture.
  </p>
</p>

<p align="center">

![Version](https://img.shields.io/badge/version-v2.0.0-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![Node](https://img.shields.io/badge/Node.js-18+-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)
![Redis](https://img.shields.io/badge/Redis-enabled-red.svg)
![BullMQ](https://img.shields.io/badge/BullMQ-background_jobs-orange.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

</p>

---

# 📖 Overview

VendorHub Enterprise Platform is a production-grade enterprise procurement platform designed using modern SaaS architecture.

Unlike traditional CRUD procurement applications, VendorHub is built as a scalable enterprise platform capable of supporting multiple organizations within a single deployment while maintaining complete tenant isolation, secure authorization, AI-assisted workflows, and enterprise-grade auditability.

The platform combines procurement management, workflow automation, AI-powered assistance, analytics, reporting, notifications, organization management, and policy-driven authorization into a single extensible architecture.

---

# 🌟 Enterprise Highlights

## 🏢 Multi-Tenant SaaS Platform

- Complete tenant isolation
- Organization-aware repositories
- TenantSession architecture
- Tenant-aware background workers
- Tenant-aware analytics
- Tenant-aware reporting
- Tenant-aware search
- Tenant-aware AI

---

## 🔐 Enterprise Identity

- JWT Authentication
- Organization Membership
- Invitation-based onboarding
- Organization Administration
- Organization Settings
- Permission-aware middleware

---

## 🎭 Dynamic Authorization

- Dynamic RBAC
- Organization Roles
- Permission Registry
- Policy Engine
- Custom Roles
- System Roles
- Authorization Middleware

---

## 🤖 Artificial Intelligence

- AI Copilot
- AI Workflow Assistant
- AI Drafts
- AI Conversations
- AI Insights
- Document Intelligence
- Permission-aware AI Responses

---

## 📦 Procurement

- Vendor Management
- Purchase Requests
- Request for Quotations (RFQ)
- Vendor Quotations
- Approval Workflows
- Procurement Analytics

---

## 📊 Business Intelligence

- Analytics Dashboard
- KPI Reporting
- Saved Reports
- Scheduled Reports
- Export Jobs
- PDF Reports
- Excel Reports
- CSV Reports

---

## 🔔 Communication Platform

- Real-time Notifications
- Socket.IO
- Email Notifications
- User Preferences
- Broadcast Notifications
- Notification Center

---

## ⚙ Workflow Engine

- Rule Engine
- Approval Processes
- Approval Delegation
- SLA Monitoring
- Workflow Automation

---

## 🔍 Enterprise Search

Global organization-scoped search across:

- Vendors
- Purchase Requests
- RFQs
- Quotations
- Notifications
- Reports
- AI Drafts
- Workflow Rules

---

# 🏗 System Architecture

```text
                           Client (React)

                                  │

                     JWT Authentication Middleware

                                  │

                      Tenant Resolution Middleware

                                  │

                     Authorization Middleware (RBAC)

                                  │

                            API Controllers

                                  │

                         Business Service Layer

                                  │

                         Domain Repositories

                                  │

                        BaseRepository Layer

                                  │

                         TenantRepository

                                  │

                              MongoDB Atlas
```

---

# 🏛 Clean Architecture

VendorHub follows a layered enterprise architecture.

```text
Client

↓

Express API

↓

Authentication

↓

Tenant Middleware

↓

Authorization Middleware

↓

Controller Layer

↓

Business Services

↓

Repository Layer

↓

Tenant Repository

↓

MongoDB
```

---

# Repository Pattern

Every business module follows the same architecture.

```text
Controller

↓

Service

↓

Repository

↓

BaseRepository

↓

TenantRepository

↓

MongoDB
```

This provides:

- Separation of concerns
- Better testing
- Tenant isolation
- Maintainability
- Enterprise scalability

---

# 🚀 Major Enterprise Features

## Procurement

- Vendor Lifecycle
- Purchase Requests
- RFQs
- Vendor Quotations
- Approval Workflow
- Award Process

---

## Organization Management

- Organizations
- Members
- Invitations
- Settings
- Administration

---

## Authorization

- Dynamic RBAC
- Policy Engine
- Permission Registry
- Organization Roles

---

## Artificial Intelligence

- AI Copilot
- AI Workflow Assistant
- AI Insights
- AI Drafts
- AI Conversations

---

## Reporting

- Analytics
- KPI Dashboard
- Saved Reports
- Scheduled Reports
- Export Jobs

---

## Infrastructure

- Repository Pattern
- Multi-Tenant SaaS
- Background Workers
- Audit Logs
- Search
- Notification Platform

---
# 💻 Technology Stack

## Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | REST API Framework |
| MongoDB | Primary Database |
| Mongoose | ODM |
| Redis | Distributed Cache |
| BullMQ | Background Job Processing |
| Socket.IO | Real-time Communication |
| JWT | Authentication |
| Bcrypt | Password Hashing |
| Joi | Request Validation |
| Nodemailer | Email Notifications |

---

## Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI Library |
| Vite | Build Tool |
| React Router | Client-side Routing |
| Tailwind CSS | Styling |
| Axios | HTTP Client |
| Lucide React | Icons |
| Recharts | Analytics Charts |

---

## AI Stack

| Technology | Purpose |
|------------|---------|
| Google Gemini | AI Copilot |
| Prompt Engineering | AI Workflows |
| Context Builder | AI Context Generation |
| Permission-aware Prompts | Secure AI Responses |

---

## DevOps

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local Development |
| GitHub Actions | CI/CD |
| MongoDB Atlas | Cloud Database |
| Render | Backend Deployment |
| Vercel | Frontend Deployment |

---

# 📂 Project Structure

```text
vendorhub-enterprise-platform/

├── client/
│
│   ├── src/
│   │
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── utils/
│   └── App.jsx
│
└── server/

    ├── src/

    │
    ├── config/
    ├── constants/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── repositories/
    ├── services/
    ├── routes/
    ├── workers/
    ├── queues/
    ├── ai/
    ├── analytics/
    ├── reports/
    ├── notifications/
    ├── search/
    ├── workflows/
    ├── utils/
    ├── validators/
    ├── tests/
    └── app.js

docs/

docker-compose.yml

README.md
```

---

# 🏢 Multi-Tenant Architecture

VendorHub is designed as a **true Multi-Tenant SaaS platform**, enabling multiple organizations to securely operate on a shared infrastructure while maintaining complete data isolation.

## Core Components

- Organization
- OrganizationMember
- OrganizationInvitation
- TenantSession
- TenantRepository
- BaseRepository
- TenantAggregationBuilder
- TenantReferenceValidator

---

## Tenant Resolution Flow

```text
Incoming Request

↓

JWT Authentication

↓

Resolve Organization

↓

Load Tenant Session

↓

Authorization

↓

Repository Layer

↓

Tenant Filter Injection

↓

MongoDB
```

Every database query automatically includes tenant filtering, ensuring complete isolation between organizations.

---

# 🏛 Repository Pattern

Every business module follows the Repository Pattern.

```text
Controller

↓

Service

↓

Repository

↓

Base Repository

↓

Tenant Repository

↓

MongoDB
```

### Benefits

- Clean separation of concerns
- Centralized database access
- Easier testing
- Automatic tenant filtering
- Reusable query logic
- Enterprise scalability

---

# 🎭 Dynamic RBAC

VendorHub implements a fully dynamic authorization model.

## Supported Features

- Organization Roles
- Permission Registry
- Authorization Policies
- System Roles
- Custom Roles
- Role Hierarchies
- Permission Inheritance
- Middleware Authorization

---

## Authorization Flow

```text
User

↓

JWT

↓

Organization

↓

Role

↓

Permissions

↓

Policy Engine

↓

Route Access
```

---

# 🤖 AI Platform

VendorHub includes an enterprise AI layer.

## AI Modules

- AI Copilot
- Workflow Assistant
- AI Draft Generator
- AI Conversations
- Procurement Insights
- Vendor Intelligence
- AI Report Assistant

---

## AI Capabilities

- Generate procurement drafts
- Summarize RFQs
- Analyze quotations
- Recommend vendors
- Workflow recommendations
- Business insights
- Smart search assistance

---

# ⚙ Workflow Engine

The Workflow Engine automates procurement approval processes.

## Features

- Configurable Workflows
- Multi-level Approvals
- Delegation
- SLA Monitoring
- Workflow Rules
- Workflow History
- Escalation Support

---

## Workflow Example

```text
Purchase Request

↓

Manager Approval

↓

Finance Approval

↓

Procurement Approval

↓

RFQ Generation

↓

Quotation Evaluation

↓

Vendor Award

↓

Purchase Order
```

---

# 📊 Analytics Platform

The Analytics Engine provides real-time business intelligence.

## Dashboards

- Spend Analytics
- Vendor Performance
- Procurement KPIs
- Approval Metrics
- Workflow Metrics
- User Activity
- Organization Insights

---

## Reporting

- Scheduled Reports
- Saved Reports
- Export Jobs
- CSV Export
- Excel Export
- PDF Export

---

# 🔔 Notification Platform

Supports enterprise communication.

## Channels

- In-App Notifications
- Socket.IO
- Email
- Admin Broadcasts

## Features

- User Preferences
- Read Tracking
- Notification Categories
- Delivery Status
- Retry Support

---

# 🔒 Security Architecture

VendorHub follows enterprise security best practices.

## Authentication

- JWT Authentication
- Secure Password Hashing
- Token Validation
- Session Isolation

---

## Authorization

- Dynamic RBAC
- Policy Engine
- Permission Registry
- Route Guards

---

## Data Security

- Tenant Isolation
- Input Validation
- Rate Limiting
- Helmet Security
- Regex Escaping
- Audit Logs

---

## Compliance

- Immutable Audit Trail
- User Activity Logs
- Organization Isolation
- Secure AI Responses

---
# 🚀 Quick Start

## Prerequisites

Before running the project, ensure the following software is installed:

- Node.js (v18 or later)
- npm (v9+)
- MongoDB Atlas or Local MongoDB
- Redis
- Docker (Optional)
- Docker Compose (Optional)
- Git

---

# 📥 Installation

## Clone Repository

```bash
git clone https://github.com/Sameer07-web/vendorhub-enterprise-platform.git

cd vendorhub-enterprise-platform
```

---

## Backend Setup

```bash
cd server

npm install
```

Create a `.env` file.

```env
PORT=5000

NODE_ENV=development

MONGODB_URI=your_mongodb_connection

JWT_SECRET=your_jwt_secret

JWT_EXPIRES_IN=7d

REDIS_URL=redis://localhost:6379

EMAIL_HOST=smtp.example.com

EMAIL_PORT=587

EMAIL_USER=example@email.com

EMAIL_PASS=password

CLIENT_URL=http://localhost:5173
```

Start backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

Frontend runs on

```
http://localhost:5173
```

Backend API

```
http://localhost:5000/api/v1
```

---

# 🐳 Docker Setup

The application is fully containerized.

Start the complete stack using Docker Compose.

```bash
docker compose up --build
```

Services started:

- React Frontend
- Express Backend
- MongoDB
- Redis

---

# ☁ Deployment

Recommended deployment architecture:

| Component | Platform |
|------------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Cache | Redis Cloud |
| Email | SendGrid / Mailtrap |
| Storage | AWS S3 |

---

# 🔌 REST API

## Authentication

```
POST /api/v1/auth/register

POST /api/v1/auth/login

POST /api/v1/auth/logout
```

---

## Organizations

```
GET /api/v1/organizations

POST /api/v1/organizations

PATCH /api/v1/organizations/:id

DELETE /api/v1/organizations/:id
```

---

## Organization Members

```
GET /api/v1/organization-members

POST /api/v1/organization-members

PATCH /api/v1/organization-members/:id

DELETE /api/v1/organization-members/:id
```

---

## Organization Invitations

```
POST /api/v1/invitations

GET /api/v1/invitations

POST /api/v1/invitations/accept
```

---

## Roles

```
GET /api/v1/roles

POST /api/v1/roles

PATCH /api/v1/roles/:id

DELETE /api/v1/roles/:id
```

---

## Policies

```
GET /api/v1/policies

POST /api/v1/policies

PATCH /api/v1/policies/:id

DELETE /api/v1/policies/:id
```

---

## Vendors

```
GET /api/v1/vendors

POST /api/v1/vendors

PATCH /api/v1/vendors/:id

DELETE /api/v1/vendors/:id
```

---

## Purchase Requests

```
GET /api/v1/purchase-requests

POST /api/v1/purchase-requests

PATCH /api/v1/purchase-requests/:id

DELETE /api/v1/purchase-requests/:id
```

---

## RFQs

```
GET /api/v1/rfqs

POST /api/v1/rfqs

PATCH /api/v1/rfqs/:id
```

---

## Quotations

```
GET /api/v1/quotations

POST /api/v1/quotations

PATCH /api/v1/quotations/:id
```

---

## Reports

```
GET /api/v1/reports

POST /api/v1/reports/export
```

---

## Notifications

```
GET /api/v1/notifications

POST /api/v1/notifications/broadcast
```

---

# 🧪 Testing

VendorHub follows a layered testing strategy.

## Unit Tests

```bash
cd server

npm test
```

---

## Integration Tests

Includes:

- Authentication
- Organization Membership
- Dynamic RBAC
- Policy Engine
- Procurement
- Tenant Isolation

Run

```bash
npm test
```

---

## Frontend Tests

```bash
cd client

npm test
```

---

# 📈 Performance

VendorHub is designed for enterprise-scale workloads.

Performance optimizations include:

- Repository Pattern
- MongoDB Indexing
- Aggregation Pipelines
- Redis Cache
- BullMQ Background Workers
- Lazy Loading
- Pagination
- Optimized Queries
- Socket.IO Event Streaming

---

# 📸 Screenshots

## Landing Page

> Add screenshot here

---

## Dashboard

> Add screenshot here

---

## Vendor Management

> Add screenshot here

---

## Organization Dashboard

> Add screenshot here

---

## Analytics

> Add screenshot here

---

## Reports

> Add screenshot here

---

## AI Copilot

> Add screenshot here

---

## Notifications

> Add screenshot here

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.

2. Create a feature branch.

```bash
git checkout -b feature/my-feature
```

3. Commit changes.

```bash
git commit -m "Add my feature"
```

4. Push your branch.

```bash
git push origin feature/my-feature
```

5. Open a Pull Request.

Please ensure all tests pass before submitting changes.

---
# 📚 Documentation

Detailed architecture and design documents are available in the `docs/` directory.

| Document | Description |
|----------|-------------|
| `ARCHITECTURE.md` | Overall system architecture and design decisions |
| `SYSTEM_DESIGN.md` | High-Level Design (HLD) and Low-Level Design (LLD) |
| `MULTI_TENANT.md` | Multi-Tenant architecture and tenant isolation strategy |
| `RBAC.md` | Dynamic RBAC, Organization Roles, and Policy Engine |
| `AI_PLATFORM.md` | AI Copilot architecture and AI workflows |
| `WORKFLOW_ENGINE.md` | Workflow engine and approval process |
| `API_REFERENCE.md` | API endpoints and request/response documentation |
| `DEPLOYMENT.md` | Deployment guide for production environments |

---

# 🛣 Roadmap

## ✅ Completed (v2.0.0)

### Platform Foundation
- ✔ Multi-Tenant SaaS Architecture
- ✔ Repository Pattern
- ✔ Clean Architecture
- ✔ Service Layer
- ✔ MongoDB Repository Layer

### Enterprise Identity
- ✔ JWT Authentication
- ✔ Organization Management
- ✔ Organization Membership
- ✔ Invitation System
- ✔ Tenant Resolution Middleware

### Authorization
- ✔ Dynamic RBAC
- ✔ Permission Registry
- ✔ Policy Engine
- ✔ Organization Roles
- ✔ Authorization Middleware

### Procurement
- ✔ Vendor Management
- ✔ Purchase Requests
- ✔ RFQs
- ✔ Quotations
- ✔ Procurement Workflow

### AI Platform
- ✔ AI Copilot
- ✔ AI Workflow Assistant
- ✔ AI Draft Generation
- ✔ AI Insights
- ✔ Context-Aware AI

### Enterprise Platform
- ✔ Analytics Dashboard
- ✔ Reports
- ✔ Export Jobs
- ✔ Notification Center
- ✔ Global Search
- ✔ Audit Logs
- ✔ Background Workers

---

## 🚧 Planned (v2.1.0)

- Subscription & Billing
- Usage Limits
- Feature Flags
- OAuth Login
- Google Login
- Microsoft Login
- SAML SSO
- SCIM Provisioning
- Webhooks
- Public REST API
- GraphQL API
- Advanced AI Reports
- Mobile Application

---

## 🔮 Long-Term Vision

- AI Procurement Assistant
- Predictive Vendor Scoring
- Contract Intelligence
- OCR Invoice Processing
- ERP Integration (SAP, Oracle)
- Marketplace Integration
- Procurement Forecasting
- Enterprise Workflow Designer
- Multi-Region Deployment
- Kubernetes Support

---

# 📊 Project Status

| Module | Status |
|---------|--------|
| Authentication | ✅ Complete |
| Organization Management | ✅ Complete |
| Multi-Tenant Architecture | ✅ Complete |
| Repository Pattern | ✅ Complete |
| Vendor Management | ✅ Complete |
| Purchase Requests | ✅ Complete |
| RFQs | ✅ Complete |
| Quotations | ✅ Complete |
| Dynamic RBAC | ✅ Complete |
| Policy Engine | ✅ Complete |
| AI Platform | ✅ Complete |
| Analytics | ✅ Complete |
| Reports | ✅ Complete |
| Notifications | ✅ Complete |
| Search | ✅ Complete |
| Background Workers | ✅ Complete |

---

# 📈 Future Enhancements

Potential enterprise enhancements include:

- Kubernetes Deployment
- Event-Driven Architecture
- Apache Kafka Integration
- Microservices Migration
- Distributed Caching
- CQRS
- Event Sourcing
- OpenTelemetry
- Prometheus & Grafana Monitoring
- Blue-Green Deployments
- Canary Releases
- Multi-Region Support

---

# 🤝 Support

If you found this project useful:

⭐ Star this repository

🍴 Fork the project

🐛 Report issues

💡 Suggest new features

🚀 Contribute to the project

---

# 👨‍💻 Author

**Mohammad Sameer**

Final Year B.Tech – Computer Science & Engineering

**GitHub**

https://github.com/Sameer07-web

**LinkedIn**

https://www.linkedin.com/in/mohammadsameer007/

---

# 📄 License

This project is licensed under the **MIT License**.

Feel free to use, modify, and distribute this project in accordance with the license terms.

---

# 🙏 Acknowledgements

This project was built by applying modern software engineering principles inspired by enterprise-scale systems, including:

- Clean Architecture
- Repository Pattern
- Domain-Driven Design (DDD)
- SOLID Principles
- Multi-Tenant SaaS Design
- Enterprise RBAC
- Secure REST API Design
- Modern DevOps Practices

---

<div align="center">

# ⭐ VendorHub Enterprise Platform

### Enterprise Multi-Tenant AI-Powered Procurement & Workflow Management SaaS Platform

Built with ❤️ using **React • Node.js • Express • MongoDB • Redis • BullMQ • Socket.IO**

**Version 2.0.0**

© 2026 Mohammad Sameer. All Rights Reserved.

</div>