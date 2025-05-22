/*
  # Add contacts management

  1. New Tables
    - `contact_types` - Enum table for contact roles (proprietário, sócio, funcionário)
    - `client_contacts` - Junction table for client contacts
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `name` (text)
      - `whatsapp` (text)
      - `type` (text, references contact_types)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Tables are unprotected as requested
*/

-- Create contact types enum table
CREATE TABLE IF NOT EXISTS contact_types (
  value text PRIMARY KEY,
  description text NOT NULL
);

-- Insert contact type values
INSERT INTO contact_types (value, description) VALUES
  ('proprietario', 'Proprietário'),
  ('socio', 'Sócio'),
  ('funcionario', 'Funcionário');

-- Create client contacts table
CREATE TABLE IF NOT EXISTS client_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  whatsapp text NOT NULL,
  type text REFERENCES contact_types(value) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);