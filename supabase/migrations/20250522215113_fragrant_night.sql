/*
  # Add pending status to clients table

  1. Changes
    - Update status check constraint to include 'pending' status option
*/

DO $$ 
BEGIN
  ALTER TABLE clients 
    DROP CONSTRAINT IF EXISTS clients_status_check;
    
  ALTER TABLE clients
    ADD CONSTRAINT clients_status_check 
    CHECK (status = ANY (ARRAY['active'::text, 'blocked'::text, 'cancelled'::text, 'pending'::text]));
END $$;