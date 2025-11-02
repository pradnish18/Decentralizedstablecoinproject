/*
  # Enable Real-time Replication

  ## Overview
  This migration enables Supabase real-time replication for key tables
  to provide instant updates to the frontend when data changes.

  ## Changes
  
  ### 1. Enable Real-time for Profiles Table
  - Allows instant updates when KYC status changes
  - Users see verification status updates immediately
  - No page refresh needed
  
  ### 2. Enable Real-time for KYC Documents Table
  - Real-time updates when documents are verified/rejected
  - Instant feedback on document status changes
  
  ### 3. Enable Real-time for Transactions Table
  - Live transaction status updates (pending → processing → completed)
  - Real-time balance updates
  - Instant notification of transaction failures

  ## Use Cases
  - KYC verification status updates appear instantly
  - Transaction status changes shown in real-time
  - Multiple devices stay in sync automatically
  - Admin changes reflect immediately for users

  ## Performance Impact
  - Minimal overhead for real-time connections
  - Only subscribed clients receive updates
  - Efficient WebSocket-based communication
*/

-- ============================================================================
-- ENABLE REALTIME REPLICATION
-- ============================================================================

-- Enable real-time for profiles table (KYC status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Enable real-time for kyc_documents table (document verification updates)
ALTER PUBLICATION supabase_realtime ADD TABLE kyc_documents;

-- Enable real-time for transactions table (transaction status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Note: Real-time subscriptions must respect RLS policies
-- Users will only receive updates for their own data based on RLS rules