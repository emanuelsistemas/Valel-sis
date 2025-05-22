/*
  # Create clients table

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `cnpj` (text)
      - `razao_social` (text)
      - `nome_fantasia` (text)
      - `observacao` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  cnpj text NOT NULL,
  razao_social text NOT NULL,
  nome_fantasia text NOT NULL,
  observacao text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);