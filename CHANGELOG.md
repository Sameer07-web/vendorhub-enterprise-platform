# Changelog

All notable changes to the VendorHub Enterprise Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-07-20

### Added
- **Enterprise Notification Platform**: Implemented a comprehensive database-backed notification system.
- **Real-Time Communication**: Integrated Socket.IO with JWT handshakes and room-based architecture for live updates.
- **Multi-channel Dispatcher**: Created a robust delivery engine supporting asynchronous, fire-and-forget delivery via WebSockets and Email.
- **Communication Management**: Introduced user notification preferences allowing granular opt-ins/opt-outs by category.
- **Admin Broadcasts**: Added capability for admins to dispatch system-wide announcements to targeted user segments, complete with rate limiting and audit logging.
- **Notification Center UI**: Added real-time search, category filtering, and live previews for broadcasts.

### Security
- Added secure JWT authentication directly into the Socket.IO handshake.
- Enforced Role-Based Access Control (RBAC) on the new Admin Broadcast API.
- Implemented in-memory rate limiting specifically for broadcast dispatching to prevent abuse.

## [1.0.0] - 2026-07-20

### Added
- **Procurement Workflows**: Complete PR and RFQ lifecycle with multi-stage approval states.
- **Quotations Comparison**: API-driven response simulation and vendor awarding module.
- **Dashboard Analytics**: Real-time KPI metrics and aggregated spend charts (Recharts).
- **Audit Logs**: Immutable system-wide CRUD activity tracking for compliance.
- **Automated Test Coverage**: Comprehensive backend (`jest`, `supertest`) and frontend (`vitest`, `testing-library`) unit and integration test suites.
- **Dockerization**: Fully dockerized application with multi-stage `Dockerfile` definitions for both backend and frontend components.
- **Compose Orchestration**: Orchestrated database, backend, and frontend via `docker-compose.yml` mapped to persistent Mongo volumes and robust health checks.
- **CI/CD Pipeline**: Integrated GitHub Actions pipeline in `.github/workflows/ci.yml` handling dependency caching, linting, testing, and production builds.
- **Telemetry & Health Diagnostics**: Added a safe `/health` endpoint to monitor backend uptime, version mapping, and database `readyState` without exposing secure credentials.
- **Logging**: Integrated `morgan` structured logging for robust web service monitoring.
- **Process Safeguards**: Intercept and gracefully shut down the node instance on `unhandledRejection` and `uncaughtException` signals.

### Changed
- Refined README with enterprise architecture diagrams, security summaries, and deployment steps.
- Replaced console-logged dashboard mock reports with interactive `toast.success` notifications to ensure zero debug traces in production builds.
- Upgraded the MongoDB schema definitions in `AuditLog.js`, `Vendor.js`, `PurchaseRequest.js`, and `RFQ.js` with explicitly constructed performance index rules.

### Security
- Added Helmet and express-rate-limit middleware to harden the API.
- Added strict payload size constraints and regex escaping for protection against DoS and ReDoS.
- Excluded environmental credential mappings via `.dockerignore`.

## [1.0.0-rc1] - 2026-07-16

*(Initial release candidate features rolled into v1.0.0)*

[Unreleased]: https://github.com/yourusername/vendorhub-enterprise-platform/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/yourusername/vendorhub-enterprise-platform/releases/tag/v1.1.0
[1.0.0]: https://github.com/yourusername/vendorhub-enterprise-platform/releases/tag/v1.0.0
