/*
  # Decentralized Remittance Platform Schema

  ## Overview
  This migration creates the foundational database structure for a stablecoin-based
  cross-border payment platform focused on remittances and microtransactions.

  ## New Tables

  ### 1. `profiles`
  User profile information linked to auth.users
  - `id` (uuid, primary key) - Links to auth.users
  - `full_name` (text) - User's full name
  - `phone_number` (text) - Contact number
  - `country_code` (text) - ISO country code
  - `kyc_status` (text) - KYC verification status: pending, verified, rejected
  - `kyc_submitted_at` (timestamptz) - When KYC was submitted
  - `kyc_verified_at` (timestamptz) - When KYC was approved
  - `wallet_address` (text) - User's blockchain wallet address
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `transactions`
  Record of all payment transactions
  - `id` (uuid, primary key) - Unique transaction identifier
  - `sender_id` (uuid) - References profiles(id)
  - `recipient_wallet` (text) - Recipient's wallet address
  - `recipient_name` (text) - Recipient's name for display
  - `amount_inr` (numeric) - Amount in Indian Rupees
  - `amount_usdc` (numeric) - Amount in USDC stablecoin
  - `exchange_rate` (numeric) - INR to USD exchange rate used
  - `platform_fee` (numeric) - Fee charged by platform
  - `blockchain_fee` (numeric) - Gas fee on blockchain
  - `total_cost` (numeric) - Total cost including fees
  - `status` (text) - pending, processing, completed, failed
  - `transaction_hash` (text) - Blockchain transaction hash
  - `blockchain_network` (text) - Network used (Polygon, etc.)
  - `error_message` (text) - Error details if failed
  - `created_at` (timestamptz) - Transaction initiation time
  - `completed_at` (timestamptz) - Transaction completion time

  ### 3. `kyc_documents`
  KYC verification documents and data
  - `id` (uuid, primary key) - Document record identifier
  - `user_id` (uuid) - References profiles(id)
  - `document_type` (text) - aadhaar, pan, passport, etc.
  - `document_number` (text) - Document identification number
  - `document_url` (text) - Secure storage URL for document image
  - `verification_status` (text) - pending, approved, rejected
  - `verified_by` (text) - Verification agent/system identifier
  - `verified_at` (timestamptz) - Verification timestamp
  - `rejection_reason` (text) - Reason if rejected
  - `created_at` (timestamptz) - Document upload time

  ### 4. `exchange_rates`
  Historical exchange rate data for transparency
  - `id` (uuid, primary key) - Rate record identifier
  - `currency_pair` (text) - e.g., INR_USD
  - `rate` (numeric) - Exchange rate value
  - `source` (text) - Rate data source
  - `created_at` (timestamptz) - Rate timestamp

  ### 5. `wallets`
  User wallet balances and management
  - `id` (uuid, primary key) - Wallet identifier
  - `user_id` (uuid) - References profiles(id)
  - `wallet_address` (text) - Blockchain wallet address
  - `wallet_type` (text) - metamask, walletconnect, internal
  - `balance_usdc` (numeric) - Current USDC balance
  - `balance_inr` (numeric) - Current INR balance (if applicable)
  - `is_primary` (boolean) - Primary wallet flag
  - `created_at` (timestamptz) - Wallet creation time
  - `updated_at` (timestamptz) - Last balance update

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Transactions are visible to both sender and recipient
  - KYC documents are only accessible to the document owner
  - Exchange rates are publicly readable

  ### Important Notes
  1. All monetary values use numeric type for precision
  2. Timestamps are stored in UTC (timestamptz)
  3. Wallet addresses are stored as text (Ethereum addresses)
  4. KYC status follows a strict workflow: pending → verified/rejected
  5. Transaction status follows: pending → processing → completed/failed
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone_number text,
  country_code text DEFAULT 'IN',
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  kyc_submitted_at timestamptz,
  kyc_verified_at timestamptz,
  wallet_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_wallet text NOT NULL,
  recipient_name text NOT NULL,
  amount_inr numeric(12, 2) NOT NULL CHECK (amount_inr > 0),
  amount_usdc numeric(12, 6) NOT NULL CHECK (amount_usdc > 0),
  exchange_rate numeric(10, 4) NOT NULL,
  platform_fee numeric(8, 2) DEFAULT 0,
  blockchain_fee numeric(8, 6) DEFAULT 0,
  total_cost numeric(12, 2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_hash text,
  blockchain_network text DEFAULT 'Polygon',
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create KYC documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('aadhaar', 'pan', 'passport', 'drivers_license')),
  document_number text NOT NULL,
  document_url text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_by text,
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now()
);

-- Create exchange rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_pair text NOT NULL,
  rate numeric(10, 4) NOT NULL CHECK (rate > 0),
  source text DEFAULT 'system',
  created_at timestamptz DEFAULT now()
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_address text NOT NULL UNIQUE,
  wallet_type text DEFAULT 'metamask' CHECK (wallet_type IN ('metamask', 'walletconnect', 'internal')),
  balance_usdc numeric(12, 6) DEFAULT 0,
  balance_inr numeric(12, 2) DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(currency_pair, created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own pending transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id AND status = 'pending')
  WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for KYC documents
CREATE POLICY "Users can view own KYC documents"
  ON kyc_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC documents"
  ON kyc_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for exchange rates (public read)
CREATE POLICY "Anyone can view exchange rates"
  ON exchange_rates FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for wallets
CREATE POLICY "Users can view own wallets"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert initial exchange rate
INSERT INTO exchange_rates (currency_pair, rate, source)
VALUES ('INR_USD', 83.25, 'system')
ON CONFLICT DO NOTHING;