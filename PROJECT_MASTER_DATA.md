# PROJECT MASTER DATA: Vehicle Service Management Platform

This document serves as the comprehensive technical manifest for the **Vehicle Service Management Platform**. it captures the complete architecture, data relationships, and operational logic of the MERN-based SaaS system.

---

## 🏗️ Technical Stack
- **Frontend**: React (Vite), Redux Toolkit, Tailwind CSS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ORM).
- **Styling**: Premium Design System (Tailwind, Glassmorphism, Dark Mode).
- **Notifications**: React Hot Toast (High-end feedback system).
- **Animations**: Custom Framer-motion style CSS keyframes.

---

## 🏛️ System Roles & Portals
The platform enforces a strict **Role-Based Access Control (RBAC)** system:

| Role | Access Level | Primary Responsibility |
| :--- | :--- | :--- |
| **Admin** | System Overlord | User management, technician provisioning, global metrics. |
| **Service Center** | Dispatcher | Appointment approval, tech assignment, invoicing. |
| **Technician** | Executor | Repair execution, labor/parts logging, completion. |
| **Customer** | Fleet Owner | Vehicle registration, service booking, payments. |

---

## 🔄 Strict Service Lifecycle
To ensure data integrity, every service request moves through a linear state machine:

1.  **PENDING APPROVAL**: Service booked by Customer.
2.  **APPROVED**: Vetted by Service Center.
3.  **TECHNICIAN ASSIGNED**: Service Center assigns a specific Mechanic.
4.  **REPAIR IN PROGRESS**: Mechanic starts the actual labor.
5.  **COMPLETED**: Mechanic logs final labor hours and parts.
6.  **INVOICE GENERATED**: Service Center bills the customer (post-completion).
7.  **PAID**: Customer settles the balance via the Payment Hub.

---

## 📊 Data Models & Schema Registry

### 1. User (`User`)
- **Fields**: `name`, `email`, `password`, `role`, `phone`, `address`, `isActive`.
- **Logic**: Soft Delete architecture. Inactive users are blocked from login but data is preserved for state management.

### 2. Vehicle (`Vehicle`)
- **Fields**: `make`, `model`, `year`, `licensePlate`, `user` (Reference to User).
- **Link**: Connected 1:N with Customers.

### 3. Appointment (`Appointment`)
- **Fields**: `user`, `vehicle`, `date`, `time`, `serviceType`, `notes`, `status`.
- **Status Enum**: `Pending Approval`, `Approved`, `Technician Assigned`, `Repair In Progress`, `Completed`.

### 4. Service Record (`ServiceRecord`)
- **Fields**: `vehicle`, `appointment`, `technician`, `serviceType`, `description`, `status`, `laborHours`, `partsUsed`, `totalCost`.
- **Logic**: Bridges the gap between the appointment and final billing.

### 5. Invoice (`Invoice`)
- **Fields**: `serviceRecord`, `vehicle`, `totalAmount`, `paymentStatus`, `paymentDate`.
- **Constraint**: Mandatory unique indexing on `serviceRecord`. One-time generation enforced.
- **Access**: Viewable anytime after generation, even after settlement.

### 6. Notification (`Notification`)
- **Fields**: `user`, `title`, `message`, `type` (Info/Alert), `isRead`.

---

## 📂 Core Directory Structure
```text
/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # UI Library (Card, Table, Loader)
│   │   ├── pages/          # Portal-specific dashboards
│   │   ├── redux/          # State Management (Slices)
│   │   └── utils/          # Constants and Icons
├── server/                 # Backend (Express API)
│   ├── controllers/        # Business Logic (Auth, User, Admin, Invoice)
│   ├── middleware/         # Auth (RBAC) & Global Error Handling
│   ├── models/             # Mongoose Schemas (User, Vehicle, Record, Invoice)
│   ├── routes/             # API Endpoints
│   └── utils/              # Data Restore & Seeding Utilities
└── PROJECT_MASTER_DATA.md  # Comprehensive Project Manifest
```

---

## 🔑 Default Performance Credentials
*For testing the full workflow:*

- **Admin**: `admin@vsm.com` / `AdminPassword123!`
- **Service Center**: `service@vsm.com` / `ServicePassword123!`
- **Technician**: `mechanic@vsm.com` / `MechanicPassword123!`
- **Customer**: `customer@vsm.com` / `CustomerPassword123!`

---
*Last Technical Audit: April 17, 2026*
