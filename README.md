# 📋 Delegation Management System

A full-stack role-based task delegation platform where organizations can assign, track, and report on delegated tasks across teams — with granular access control for **Super Admins**, **Admins**, and **Users**.

🔗 **Live Demo:** [delegationmanagement.netlify.app](https://delegationmanagement.netlify.app)
🔗 **API Base:** [delegation-management.vercel.app](https://delegation-management.vercel.app)

> **Demo Credentials**
>
> | Role | Email | Password |
> |------|-------|----------|
> | Super Admin | `superadmin@gmail.com` | `123456` |

---

## ⚡ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| Vite 7 | Build tool & dev server |
| Redux Toolkit | Global state management |
| React Router v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Recharts | Dashboard charts (pie, bar, line) |
| Axios | HTTP client with cookie credentials |
| Lucide React | Icon set |

### Backend

| Technology | Purpose |
|------------|---------|
| Express 4 | REST API framework |
| MySQL2 | Database driver (promise-based pool) |
| JSON Web Tokens | Stateless auth via httpOnly cookies |
| Bcrypt.js | Password hashing |
| Cookie Parser | Parse auth cookies from requests |
| Morgan | HTTP request logging |
| CORS | Cross-origin resource sharing |
| Dotenv | Environment variable management |

---

## 📁 Folder Structure

```
Delegation management/
├── client/                         # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios instance (withCredentials, 401 interceptor)
│   │   ├── app/
│   │   │   └── store.js            # Redux store configuration
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── StatusPieChart.jsx
│   │   │   │   ├── TimeLineChart.jsx
│   │   │   │   └── UserBarChart.jsx
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── ConfirmModal.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── PasswordInput.jsx
│   │   │   │   └── Select.jsx
│   │   │   └── layout/
│   │   │       ├── DashboardLayout.jsx
│   │   │       ├── Navbar.jsx
│   │   │       └── Sidebar.jsx
│   │   ├── features/
│   │   │   ├── auth/authSlice.js
│   │   │   ├── delegations/delegationsSlice.js
│   │   │   ├── reports/reportsSlice.js
│   │   │   └── users/usersSlice.js
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Delegations.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Users.jsx
│   │   │   └── NotFound.jsx
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RoleRoute.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MySQL connection pool
│   │   ├── constants/
│   │   │   └── roles.js            # SUPER_ADMIN, ADMIN, USER enums
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── delegation.controller.js
│   │   │   ├── report.controller.js
│   │   │   └── user.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js   # JWT cookie verification
│   │   │   ├── error.middleware.js  # Global error handler
│   │   │   ├── role.middleware.js   # authorizeRoles(...allowedRoles)
│   │   │   └── validate.middleware.js
│   │   ├── models/
│   │   │   ├── activity.model.js
│   │   │   ├── delegation.model.js
│   │   │   ├── report.model.js
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── delegation.routes.js
│   │   │   ├── report.routes.js
│   │   │   └── user.routes.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── delegation.service.js
│   │   │   ├── report.service.js
│   │   │   └── user.service.js
│   │   ├── utils/
│   │   │   ├── hash.js             # bcrypt hash & compare
│   │   │   └── jwt.js              # generateToken / verifyToken
│   │   └── server.js               # Single entry — Express app + DB connect + Vercel export
│   ├── schema.sql                   # Full database schema
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Schema

Three core tables in **MySQL** (InnoDB, utf8mb4):

### `users`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT |
| `name` | VARCHAR(255) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `password` | VARCHAR(255) | NOT NULL (bcrypt hash) |
| `role` | ENUM('superadmin', 'admin', 'user') | NOT NULL, DEFAULT 'user' |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### `delegations`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT |
| `title` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | NULLABLE |
| `assigned_to` | INT | FK → users(id) ON DELETE CASCADE |
| `created_by` | INT | FK → users(id) ON DELETE CASCADE |
| `status` | ENUM('pending', 'in-progress', 'completed') | DEFAULT 'pending' |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### `activity_logs`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT |
| `user_id` | INT | FK → users(id) ON DELETE CASCADE |
| `action` | VARCHAR(512) | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## 🔐 Features & Role-Based Access Control (RBAC)

Authentication is handled via **JWT tokens stored in httpOnly cookies** — the frontend never touches the token directly. Two middleware layers protect every route:

1. **`authenticate`** — Extracts and verifies the JWT from `req.cookies.token`. Attaches `{ id, role }` to `req.user`.
2. **`authorizeRoles(...roles)`** — Checks if `req.user.role` is in the allowed set; returns 403 if not.

### Permission Matrix

| Action | Super Admin | Admin | User |
|--------|:-----------:|:-----:|:----:|
| View dashboard & reports | ✅ | ✅ | ✅ |
| View own delegations | ✅ | ✅ | ✅ |
| Update delegation status | ✅ | ✅ | ✅ |
| View all delegations | ✅ | ✅ (scoped to created) | ❌ |
| Create delegations | ✅ | ✅ | ❌ |
| Create users | ✅ | ✅ | ❌ |
| Create admins | ✅ | ❌ | ❌ |
| Manage user roles | ✅ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ |
| Delete delegations | ✅ | ❌ | ❌ |
| View user workload report | ✅ | ❌ | ❌ |

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/bootstrap-superadmin` | ❌ | Create first super admin (bootstrap only) |
| POST | `/register` | ❌ | Register a new user account |
| POST | `/login` | ❌ | Login and receive httpOnly cookie |
| POST | `/logout` | ✅ | Clear auth cookie |
| GET | `/me` | ✅ | Get current user profile |

### Users — `/api/users`

| Method | Endpoint | Roles | Description |
|--------|----------|:-----:|-------------|
| POST | `/create-admin` | Super Admin | Create an admin account |
| POST | `/create-user` | Admin, Super Admin | Create a user account |
| GET | `/all-users` | Admin, Super Admin | List all users |
| PATCH | `/:id/role` | Super Admin | Update a user's role |
| DELETE | `/:id` | Super Admin | Delete a user |

### Delegations — `/api/delegations`

| Method | Endpoint | Roles | Description |
|--------|----------|:-----:|-------------|
| POST | `/create` | Admin, Super Admin | Create a new delegation |
| GET | `/` | All authenticated | List delegations (scoped by role) |
| GET | `/recent` | All authenticated | Recent delegations |
| PUT | `/:id/status` | All authenticated | Update delegation status |
| DELETE | `/:id` | Super Admin | Delete a delegation |

### Reports — `/api/reports`

| Method | Endpoint | Roles | Description |
|--------|----------|:-----:|-------------|
| GET | `/` | All authenticated | Dashboard report data (scoped by role) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (top-level `await` support required)
- **MySQL** 8.0+ (local or hosted — e.g., Railway, PlanetScale)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/delegation-management.git
cd delegation-management
```

### 2. Setup the database

Run `server/schema.sql` against your MySQL instance to create the `users`, `delegations`, and `activity_logs` tables.

### 3. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=railway
DB_TIMEZONE=+05:30

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES=1d

CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### 4. Frontend setup

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

### 5. Bootstrap the first Super Admin

```bash
curl -X POST http://localhost:5000/api/auth/bootstrap-superadmin \
  -H "Content-Type: application/json" \
  -d '{"name":"Super Admin","email":"superadmin@gmail.com","password":"123456"}'
```

Then login at `http://localhost:5173/login` with the credentials above.

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | **Netlify** | [delegationmanagement.netlify.app](https://delegationmanagement.netlify.app) |
| Backend | **Vercel** (serverless) | [delegation-management.vercel.app](https://delegation-management.vercel.app) |
| Database | **Railway** (MySQL) | Private |

The backend uses a single `server.js` entry that `export default app` for Vercel's serverless runtime, while `app.listen()` is only called locally (skipped when `process.env.VERCEL` is set by the platform).

Cross-origin cookies work in production via `SameSite=None; Secure` on all auth cookies, with CORS configured to allow the Netlify frontend origin with credentials.

---

## 🚀 Future Improvements & Scaling

Given the limited time constraint, the current MVP (Minimum Viable Product) is fully functional. However, to scale this to a production-ready enterprise application, the following improvements are planned:

### 🔐 Advanced Identity Management

- **OAuth 2.0 & SSO** — Integration with Google / Microsoft Azure for Single Sign-On (SSO) to streamline corporate access.
- **Multi-Factor Authentication (MFA)** — Implementation of Email-OTP and SMS verification layers for high-security roles.

### 📊 Real-time Dashboard & Scalability

- **WebSocket Integration** — Transitioning from polling to WebSockets (Socket.io) for real-time chart updates and instant "Toast" notifications when tasks are assigned or updated.
- **Distributed Management Logic** — Decoupling the management sections so each module (Users, Tasks, Reports) operates independently, allowing for microservices-style scaling as the user base grows.

### ⚡ Performance & Reliability

- **Core Web Vitals Optimization** — Improving LCP (Largest Contentful Paint) and FID (First Input Delay) through code-splitting, lazy loading of charts, and edge-caching on Vercel.
- **File Attachments** — Integrating AWS S3 for secure document storage linked to delegations.
- **Data Integrity** — Moving toward Soft Deletes (`deleted_at` timestamps) to prevent permanent data loss and allow for audit recovery.
- **Automated Testing** — Implementing Jest and Supertest for CI/CD pipeline reliability.

---

## 📄 License
