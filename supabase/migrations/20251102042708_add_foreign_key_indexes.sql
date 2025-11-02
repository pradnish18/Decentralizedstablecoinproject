/*
  # Add Indexes for Foreign Keys

  ## Overview
  This migration adds indexes to foreign key columns that are missing them.
  This improves query performance for JOIN operations and foreign key lookups.

  ## Changes
  
  ### 1. KYC Documents Table
  - Add index on `user_id` column (foreign key to profiles)
  - Improves performance when querying documents by user
  - Speeds up JOIN operations between kyc_documents and profiles
  
  ### 2. Wallets Table
  - Add index on `user_id` column (foreign key to profiles)
  - Improves performance when querying wallets by user
  - Speeds up JOIN operations between wallets and profiles

  ## Performance Impact
  - Faster queries when filtering by user_id
  - Better JOIN performance
  - Improved foreign key constraint checking
  - Essential for queries that lookup user's documents or wallets

  ## Notes
  - These indexes were previously removed but are actually needed
  - Foreign keys should typically have indexes for optimal performance
  - Small storage overhead but significant query performance gain
*/

-- ============================================================================
-- KYC_DOCUMENTS TABLE - Add Foreign Key Index
-- ============================================================================

-- Index for user_id foreign key
-- Improves queries like: SELECT * FROM kyc_documents WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id 
  ON kyc_documents(user_id);

-- ============================================================================
-- WALLETS TABLE - Add Foreign Key Index
-- ============================================================================

-- Index for user_id foreign key
-- Improves queries like: SELECT * FROM wallets WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_wallets_user_id 
  ON wallets(user_id);

-- ============================================================================
-- VERIFY INDEXES
-- ============================================================================

-- Note: You can verify these indexes are being used by running:
-- EXPLAIN ANALYZE SELECT * FROM kyc_documents WHERE user_id = 'some-uuid';
-- EXPLAIN ANALYZE SELECT * FROM wallets WHERE user_id = 'some-uuid';