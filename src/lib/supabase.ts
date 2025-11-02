import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  phone_number: string | null;
  country_code: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_submitted_at: string | null;
  kyc_verified_at: string | null;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  sender_id: string;
  recipient_wallet: string;
  recipient_name: string;
  amount_inr: number;
  amount_usdc: number;
  exchange_rate: number;
  platform_fee: number;
  blockchain_fee: number;
  total_cost: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transaction_hash: string | null;
  blockchain_network: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

export type ExchangeRate = {
  id: string;
  currency_pair: string;
  rate: number;
  source: string;
  created_at: string;
};

export type Wallet = {
  id: string;
  user_id: string;
  wallet_address: string;
  wallet_type: 'metamask' | 'walletconnect' | 'internal';
  balance_usdc: number;
  balance_inr: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};
