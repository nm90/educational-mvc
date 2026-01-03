-- Educational MVC App - Database Schema
--
-- Learning Purpose:
-- This schema demonstrates fundamental relational database concepts:
-- - Primary keys (unique identifiers)
-- - Foreign keys (relationships between tables)
-- - Constraints (data integrity rules)
-- - Indexes (query performance optimization)
--
-- MVC Context:
-- - Models interact with these tables
-- - Controllers never write SQL directly
-- - Views display data from these tables
--
-- Covered in: Lesson 2 (Data Flow), Lesson 3 (User Model), Lesson 4 (Task Model)

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores user information
-- Relationships: One user can own many tasks, one user can be assigned many tasks

CREATE TABLE IF NOT EXISTS users (
    -- Primary key: Auto-incrementing unique identifier
    -- SQLite uses INTEGER PRIMARY KEY for auto-increment
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- User details
    name TEXT NOT NULL,

    -- Email must be unique (enforces one account per email)
    email TEXT NOT NULL UNIQUE,

    -- Timestamp: Automatically set when record is created
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Constraint names help with debugging
    CONSTRAINT users_email_unique UNIQUE (email)
);

-- Index on email for fast lookups during login/search
-- (UNIQUE constraint already creates an index, but this is explicit for learning)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- ============================================================================
-- TASKS TABLE
-- ============================================================================
-- Stores task information with ownership and assignment tracking
-- Relationships:
-- - Each task has one owner (the user who created it)
-- - Each task may have one assignee (the user assigned to complete it)

CREATE TABLE IF NOT EXISTS tasks (
    -- Primary key: Auto-incrementing unique identifier
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Task details
    title TEXT NOT NULL,
    description TEXT,

    -- Status enum: Controls task workflow
    -- CHECK constraint enforces valid values (prevents invalid data)
    status TEXT NOT NULL DEFAULT 'todo'
        CHECK (status IN ('todo', 'in-progress', 'done')),

    -- Priority enum: Helps with task organization
    -- CHECK constraint enforces valid values
    priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),

    -- Foreign keys: Establish relationships with users table
    -- owner_id: The user who created this task (required)
    owner_id INTEGER NOT NULL,

    -- assignee_id: The user assigned to this task (optional, can be NULL)
    assignee_id INTEGER,

    -- Timestamps: Track creation and updates
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints: Enforce referential integrity
    -- These ensure that owner_id and assignee_id always point to valid users
    -- ON DELETE CASCADE: If a user is deleted, their tasks are also deleted
    -- (In production, you might use ON DELETE SET NULL or handle differently)
    CONSTRAINT fk_tasks_owner
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_tasks_assignee
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for foreign keys: Speed up JOINs and lookups
-- ✅ DO: Index foreign key columns for better query performance
-- Lesson 4 demonstrates why these indexes matter for JOIN queries

CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);

-- Additional indexes for common queries
-- Index on status: Fast filtering by task status (todo, in-progress, done)
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Index on priority: Fast filtering by priority
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Composite index: Fast queries that filter by status AND priority together
-- Example query: SELECT * FROM tasks WHERE status = 'todo' AND priority = 'high'
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);


-- ============================================================================
-- LEARNING NOTES
-- ============================================================================
--
-- Why foreign keys matter:
-- - Prevent orphaned data (tasks pointing to non-existent users)
-- - Enable CASCADE behavior (automatic cleanup)
-- - Self-documenting relationships
-- - Database enforces data integrity (not just application code)
--
-- Why indexes matter:
-- - Without index: Database scans entire table (slow for large datasets)
-- - With index: Database uses tree structure to find rows quickly
-- - Trade-off: Indexes speed up reads but slow down writes slightly
-- - Lesson 4 shows query execution time with/without indexes
--
-- Timestamp patterns:
-- - created_at: Never changes, records when row was first created
-- - updated_at: Should be updated whenever row changes
-- - (Note: SQLite doesn't auto-update updated_at, we'll handle in Model code)
--
-- SQLite quirks vs other databases:
-- - Uses INTEGER PRIMARY KEY instead of AUTO_INCREMENT
-- - Uses TEXT instead of VARCHAR
-- - More permissive type system (type affinity)
-- - Foreign key enforcement must be enabled with PRAGMA (we'll do this in code)
--
-- ============================================================================
