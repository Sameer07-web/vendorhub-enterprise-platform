# Release Notes - VendorHub Enterprise Platform v1.1.0

**Release Date:** 2026-07-20

We are proud to announce the release of **VendorHub Enterprise Platform v1.1.0**, which elevates the application from a robust procurement system to a fully-featured **Enterprise Communication Platform**.

## 🚀 Key Highlights

### Enterprise Notification Platform
- **Database-Backed Persistence**: A robust `Notification` schema tracks all system alerts, purchase request statuses, and vendor invitations.
- **Dispatcher Engine**: A new Notification Dispatcher handles fire-and-forget delivery, completely decoupling business services from communication logic.

### Real-Time Communication
- **Socket.IO Integration**: Users now receive live updates directly in their browser without refreshing.
- **Secure Handshakes**: WebSockets are secured via JWT authentication at the handshake level, utilizing a highly scalable `room-based` architecture.

### Granular User Preferences
- **Opt-In/Opt-Out**: Users can customize their experience through the new **Notification Settings** page, allowing them to disable specific channels (Email, In-App) or categories (RFQs, PRs).
- **Preference Evaluation**: The dispatcher actively respects user preferences before pushing notifications to channels.

### Admin Broadcasts
- **Targeted Announcements**: Admins can now dispatch critical, system-wide announcements to targeted roles (e.g., All Users, Managers, Employees).
- **Rate-Limited & Audited**: Built-in 10-per-hour rate limit prevents abuse, and all broadcasts are permanently recorded in the Audit Logs.
- **Live Preview UI**: A sleek admin UI allows live previewing of broadcasts before they are sent.

### Enhanced User Experience
- **Notification Center**: Advanced search and filtering (Categories, Unread vs All, Date filtering) allows users to easily manage their alerts.

## 🛠 Engineering & Architecture Improvements
The notification pipeline introduces a highly scalable pattern for future integrations:
`Business Event` ➔ `Notification Service` ➔ `Database` ➔ `Dispatcher` ➔ `Preference Engine` ➔ `Delivery Channels (Sockets/Email)`

This release maintains our strict 10/10 standards for Architecture, Security, and Enterprise Value.
