/*
  # Create status workflow table

  1. New Tables
    - `status_workflow`
      - `current_status` (text, references client status)
      - `next_status` (text, references client status)
      - `created_at` (timestamp)
  
  2. Changes
    - Add new status 'pending' to clients table status check constraint
*/

CREATE TABLE IF NOT EXISTS status_workflow (
  current_status text NOT NULL,
  next_status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (current_status, next_status),
  CONSTRAINT status_workflow_current_status_check
    CHECK (current_status = ANY (ARRAY['active', 'blocked', 'cancelled', 'pending'])),
  CONSTRAINT status_workflow_next_status_check
    CHECK (next_status = ANY (ARRAY['active', 'blocked', 'cancelled', 'pending']))
);

-- Insert initial workflow rules
INSERT INTO status_workflow (current_status, next_status) VALUES
  ('active', 'blocked'),
  ('active', 'cancelled'),
  ('blocked', 'pending'),
  ('blocked', 'cancelled'),
  ('cancelled', 'pending'),
  ('pending', 'active'),
  ('pending', 'cancelled');

-- Update clients table status constraint
DO $$ 
BEGIN
  ALTER TABLE clients 
    DROP CONSTRAINT IF EXISTS clients_status_check;
    
  ALTER TABLE clients
    ADD CONSTRAINT clients_status_check 
    CHECK (status = ANY (ARRAY['active'::text, 'blocked'::text, 'cancelled'::text, 'pending'::text]));
END $$;