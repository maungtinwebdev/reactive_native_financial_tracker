-- ================================================
-- Supabase Migration: Create `transactions` table
-- Run this in the Supabase SQL Editor
-- ================================================

-- Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id          TEXT PRIMARY KEY,
  amount      NUMERIC(12, 2) NOT NULL,
  date        TIMESTAMPTZ     NOT NULL,
  description TEXT            NOT NULL DEFAULT '',
  category    TEXT            NOT NULL DEFAULT '',
  type        TEXT            NOT NULL CHECK (type IN ('income', 'expense')),
  synced_at   TIMESTAMPTZ     DEFAULT NOW(),
  created_at  TIMESTAMPTZ     DEFAULT NOW()
);

-- Index for fast date-range queries
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date DESC);

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);

-- Enable Row Level Security (RLS)
-- For now, allow all operations with the anon key.
-- In production, you should add auth-based policies.
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (matches the anon key usage)
CREATE POLICY "Allow anonymous full access"
  ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);
