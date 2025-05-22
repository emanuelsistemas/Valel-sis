/*
  # Update clients table for CPF/CNPJ support

  1. Changes
    - Add document_type column to clients table
    - Rename cnpj column to document
    - Add check constraint for document_type values
    - Make razao_social nullable for CPF cases
*/

DO $$ BEGIN
  -- Add document_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'document_type'
  ) THEN
    ALTER TABLE clients ADD COLUMN document_type text NOT NULL DEFAULT 'cnpj';
    ALTER TABLE clients ADD CONSTRAINT clients_document_type_check 
      CHECK (document_type IN ('cpf', 'cnpj'));
  END IF;

  -- Rename cnpj to document
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'cnpj'
  ) THEN
    ALTER TABLE clients RENAME COLUMN cnpj TO document;
  END IF;

  -- Make razao_social nullable
  ALTER TABLE clients ALTER COLUMN razao_social DROP NOT NULL;
END $$;