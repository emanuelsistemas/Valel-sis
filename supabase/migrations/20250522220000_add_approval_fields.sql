/*
  # Create client_approvals table for Kanban workflow

  1. New Table
    - `client_approvals`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `approval_status` (text) - cancelled, blocked, pending, active
      - `approved_by` (text) - username who approved
      - `approved_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. This table will manage the approval workflow separately from the main clients table
*/

CREATE TABLE IF NOT EXISTS client_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  approval_status text NOT NULL CHECK (approval_status IN ('cancelled', 'blocked', 'pending', 'active')),
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Ensure only one approval record per client
  UNIQUE(client_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_client_approvals_status ON client_approvals(approval_status);
CREATE INDEX IF NOT EXISTS idx_client_approvals_client_id ON client_approvals(client_id);
