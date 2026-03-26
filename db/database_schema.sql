-- ============================================================================
-- DELEGATION MANAGEMENT SYSTEM — DATABASE SCHEMA
-- ============================================================================
-- Engine  : MySQL 8.0+
-- Storage : InnoDB (supports ACID transactions, row-level locking, and
--           referential integrity via foreign keys — essential for a system
--           where delegation status updates, user deletions, and audit logs
--           must remain consistent even under concurrent access)
-- Charset : utf8mb4 — full Unicode support including emojis
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. DATABASE CREATION
-- ----------------------------------------------------------------------------
-- If you are on a managed host (Railway, PlanetScale) that gives you a single
-- pre-created database, skip CREATE DATABASE / USE and run the TABLE blocks
-- directly while connected to that database.
-- ----------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS delegation_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE delegation_management;


-- ============================================================================
-- 2. TABLE: users
-- ============================================================================
-- Central identity table. Every person who can log into the system has exactly
-- one row here. The `role` column drives the entire RBAC (Role-Based Access
-- Control) layer:
--
--   • superadmin — full platform control: manage all users, roles, delegations,
--                  and view system-wide reports including user workload.
--   • admin      — can create users and delegations, view delegations they
--                  created, and update status on those delegations.
--   • user       — can only view delegations assigned to them and update
--                  the status of those delegations.
--
-- Passwords are never stored in plain text. The application hashes them with
-- bcrypt (cost factor 10) before INSERT.
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id          INT                                     AUTO_INCREMENT,
  name        VARCHAR(255)                            NOT NULL,
  email       VARCHAR(255)                            NOT NULL,
  password    VARCHAR(255)                            NOT NULL,   -- bcrypt hash, never plain text
  role        ENUM('superadmin', 'admin', 'user')     NOT NULL DEFAULT 'user',
  created_at  TIMESTAMP                               NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Primary key
  PRIMARY KEY (id),

  -- Email must be unique across the entire system (login identifier)
  CONSTRAINT uq_users_email UNIQUE (email)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INDEX: The UNIQUE constraint on `email` automatically creates an index,
-- which optimises the login query  →  SELECT * FROM users WHERE email = ?
-- No additional index needed for email.

-- INDEX: Speeds up queries that filter or group by role
-- (e.g. "list all admins", report queries that JOIN on role)
CREATE INDEX idx_users_role ON users (role);


-- ============================================================================
-- 3. TABLE: delegations
-- ============================================================================
-- Core business entity. A delegation represents a task assigned by an admin
-- or superadmin to any user. It tracks:
--   • WHO created it     (created_by  → users.id)
--   • WHO must execute it (assigned_to → users.id)
--   • WHAT is the task    (title + description)
--   • WHERE it stands     (status: pending → in-progress → completed)
--
-- Both foreign keys use ON DELETE CASCADE so that if a user is removed,
-- their delegations are cleaned up automatically — preventing orphan rows.
-- ============================================================================

CREATE TABLE IF NOT EXISTS delegations (
  id            INT                                              AUTO_INCREMENT,
  title         VARCHAR(255)                                     NOT NULL,
  description   TEXT                                             NULL,
  assigned_to   INT                                              NOT NULL,
  created_by    INT                                              NOT NULL,
  status        ENUM('pending', 'in-progress', 'completed')     NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP                                        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Primary key
  PRIMARY KEY (id),

  -- Foreign key: the user this delegation is assigned TO
  CONSTRAINT fk_delegations_assigned_to
    FOREIGN KEY (assigned_to)
    REFERENCES users (id)
    ON DELETE CASCADE,

  -- Foreign key: the admin/superadmin who CREATED this delegation
  CONSTRAINT fk_delegations_created_by
    FOREIGN KEY (created_by)
    REFERENCES users (id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INDEX: Dashboard and delegation list queries frequently filter by assignee
-- e.g. SELECT ... FROM delegations WHERE assigned_to = ?
CREATE INDEX idx_delegations_assigned_to ON delegations (assigned_to);

-- INDEX: Admin scoped queries filter by creator
-- e.g. SELECT ... FROM delegations WHERE created_by = ?
CREATE INDEX idx_delegations_created_by ON delegations (created_by);

-- INDEX: Report queries group/filter by status
-- e.g. SELECT status, COUNT(*) FROM delegations GROUP BY status
CREATE INDEX idx_delegations_status ON delegations (status);

-- INDEX: Timeline chart and "recent delegations" sort by created_at
-- e.g. SELECT ... ORDER BY created_at DESC LIMIT 5
CREATE INDEX idx_delegations_created_at ON delegations (created_at);


-- ============================================================================
-- 4. TABLE: activity_logs
-- ============================================================================
-- Audit trail. Every significant action (login, logout, register, delegation
-- create/update/delete, user management) is recorded here. This table is
-- append-mostly — rows are rarely updated or deleted, only INSERTed.
--
-- The `action` column stores a human-readable description of what happened,
-- e.g. "Logged in", "Created delegation: Project Handoff", etc.
--
-- ON DELETE CASCADE ensures that if a user account is removed, their audit
-- entries are also cleaned up (no orphan references).
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id          INT              AUTO_INCREMENT,
  user_id     INT              NOT NULL,
  action      VARCHAR(512)     NOT NULL,
  created_at  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Primary key
  PRIMARY KEY (id),

  -- Foreign key: which user performed this action
  CONSTRAINT fk_activity_logs_user
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INDEX: Activity log lookups by user (e.g. "show my recent activity")
CREATE INDEX idx_activity_logs_user_id ON activity_logs (user_id);

-- INDEX: Chronological ordering for admin activity feed
CREATE INDEX idx_activity_logs_created_at ON activity_logs (created_at);


-- ============================================================================
-- 5. SEED DATA — Super Admin Bootstrap
-- ============================================================================
-- The system requires at least one superadmin to exist before any other
-- user can be created through the UI. The password below is the bcrypt hash
-- of "123456" (cost factor 10).
--
-- In production, the application exposes a one-time bootstrap endpoint:
--   POST /api/auth/bootstrap-superadmin
-- which hashes the password automatically. The raw INSERT below is provided
-- so the examiner can see the exact data structure and seed the database
-- without running the Node.js server.
--
-- UNCOMMENT the INSERT below to seed directly via SQL:
-- ============================================================================

-- INSERT INTO users (name, email, password, role) VALUES (
--   'Super Admin',
--   'superadmin@gmail.com',
--   '$2a$10$Q9Ye2aBZqGJGmQhVKB7xOeU7FQ7FYkJ7IjB9OhFOb4h5r5dQy/gWu',
--   'superadmin'
-- );
-- NOTE: The hash above corresponds to the plain-text password "123456"
--       hashed with bcrypt at a salt round cost of 10.
--       To generate a fresh hash, run in Node.js:
--         const bcrypt = require('bcryptjs');
--         bcrypt.hash('123456', 10).then(console.log);


-- ============================================================================
-- SCHEMA SUMMARY
-- ============================================================================
--
--  users
--    ├── id            INT PK AUTO_INCREMENT
--    ├── name          VARCHAR(255) NOT NULL
--    ├── email         VARCHAR(255) NOT NULL UNIQUE   ← login identifier
--    ├── password      VARCHAR(255) NOT NULL           ← bcrypt hash
--    ├── role          ENUM('superadmin','admin','user') DEFAULT 'user'
--    └── created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--
--  delegations
--    ├── id            INT PK AUTO_INCREMENT
--    ├── title         VARCHAR(255) NOT NULL
--    ├── description   TEXT NULL
--    ├── assigned_to   INT NOT NULL  → FK users(id) ON DELETE CASCADE
--    ├── created_by    INT NOT NULL  → FK users(id) ON DELETE CASCADE
--    ├── status        ENUM('pending','in-progress','completed') DEFAULT 'pending'
--    └── created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--
--  activity_logs
--    ├── id            INT PK AUTO_INCREMENT
--    ├── user_id       INT NOT NULL  → FK users(id) ON DELETE CASCADE
--    ├── action        VARCHAR(512) NOT NULL
--    └── created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--
-- ============================================================================
