/*
  # Optimize RLS Policies and Security

  ## Overview
  This migration optimizes Row Level Security policies for better performance at scale
  and improves overall database security configuration.

  ## Changes
  
  ### 1. RLS Policy Optimization
  - Replace all `auth.uid()` calls with `(select auth.uid())`
  - This prevents re-evaluation of auth functions for each row
  - Significantly improves query performance at scale
  
  ### 2. Index Cleanup
  - Remove unused indexes to reduce overhead
  - Keep only actively used indexes for optimal performance
  
  ### 3. Security Enhancements
  - All policies use optimized auth function calls
  - Maintains security while improving performance

  ## Affected Tables
  - profiles (3 policies optimized)
  - transactions (3 policies optimized)
  - kyc_documents (2 policies optimized)
  - wallets (4 policies optimized)

  ## Performance Impact
  - Reduces CPU usage for RLS checks
  - Improves query response times
  - Better scalability for large datasets
*/

-- ============================================================================
-- PROFILES TABLE - Optimize RLS Policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- TRANSACTIONS TABLE - Optimize RLS Policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own pending transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = sender_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = sender_id);

CREATE POLICY "Users can update own pending transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = sender_id AND status = 'pending')
  WITH CHECK ((select auth.uid()) = sender_id);

-- ============================================================================
-- KYC_DOCUMENTS TABLE - Optimize RLS Policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own KYC documents" ON kyc_documents;
DROP POLICY IF EXISTS "Users can insert own KYC documents" ON kyc_documents;

CREATE POLICY "Users can view own KYC documents"
  ON kyc_documents FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own KYC documents"
  ON kyc_documents FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- WALLETS TABLE - Optimize RLS Policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can insert own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can update own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can delete own wallets" ON wallets;

CREATE POLICY "Users can view own wallets"
  ON wallets FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own wallets"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own wallets"
  ON wallets FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own wallets"
  ON wallets FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- INDEX OPTIMIZATION - Remove Unused Indexes
-- ============================================================================

-- Remove unused indexes to reduce write overhead
-- Keep only indexes that are actively used by queries

DROP INDEX IF EXISTS idx_transactions_status;
DROP INDEX IF EXISTS idx_transactions_created;
DROP INDEX IF EXISTS idx_kyc_user;
DROP INDEX IF EXISTS idx_wallets_user;
DROP INDEX IF EXISTS idx_wallets_address;

-- Keep the essential index for transaction lookups by sender
-- idx_transactions_sender is still needed and will remain

-- Note: Indexes can be re-added later if query patterns change
-- and these indexes become necessary for performance