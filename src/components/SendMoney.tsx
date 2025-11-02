import { useState, useEffect } from 'react';
import { Send, TrendingUp, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ExchangeRate } from '../lib/supabase';

export function SendMoney() {
  const { user, profile } = useAuth();
  const [amountINR, setAmountINR] = useState('');
  const [recipientWallet, setRecipientWallet] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('currency_pair', 'INR_USD')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && !error) {
      setExchangeRate(data);
    }
  };

  const calculateAmounts = () => {
    const inr = parseFloat(amountINR) || 0;
    const usd = exchangeRate ? inr / exchangeRate.rate : 0;
    const platformFee = inr * 0.005;
    const blockchainFee = 0.05;
    const total = inr + platformFee;

    return {
      amountUSDC: usd.toFixed(6),
      platformFee: platformFee.toFixed(2),
      blockchainFee: blockchainFee.toFixed(2),
      totalCost: total.toFixed(2),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      setError('Please sign in to send money');
      return;
    }

    if (profile.kyc_status !== 'verified') {
      setError('Please complete KYC verification before sending money');
      return;
    }

    if (!exchangeRate) {
      setError('Exchange rate not available. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const amounts = calculateAmounts();

      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          sender_id: user.id,
          recipient_wallet: recipientWallet,
          recipient_name: recipientName,
          amount_inr: parseFloat(amountINR),
          amount_usdc: parseFloat(amounts.amountUSDC),
          exchange_rate: exchangeRate.rate,
          platform_fee: parseFloat(amounts.platformFee),
          blockchain_fee: parseFloat(amounts.blockchainFee),
          total_cost: parseFloat(amounts.totalCost),
          status: 'pending',
          blockchain_network: 'Polygon',
        });

      if (txError) throw txError;

      setSuccess(true);
      setAmountINR('');
      setRecipientWallet('');
      setRecipientName('');

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const amounts = calculateAmounts();

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600">Please sign in to send money internationally</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Send className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Send Money</h3>
          <p className="text-sm text-gray-600">Fast, secure cross-border transfers</p>
        </div>
      </div>

      {profile?.kyc_status !== 'verified' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">KYC Verification Required</p>
            <p className="text-sm text-yellow-700">Complete your KYC to start sending money</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">Transaction Created!</p>
            <p className="text-sm text-green-700">Your payment is being processed</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {exchangeRate && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-900">
            <strong>Exchange Rate:</strong> ₹{exchangeRate.rate.toFixed(2)} = $1.00 USD
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (INR)
          </label>
          <input
            type="number"
            value={amountINR}
            onChange={(e) => setAmountINR(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter amount in ₹"
            min="1"
            step="0.01"
            required
          />
          {amountINR && (
            <p className="mt-2 text-sm text-gray-600">
              ≈ ${amounts.amountUSDC} USDC
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Name
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter recipient's name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient MetaMask Wallet Address
          </label>
          <input
            type="text"
            value={recipientWallet}
            onChange={(e) => setRecipientWallet(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
            placeholder="0x..."
            required
            pattern="^0x[a-fA-F0-9]{40}$"
            title="Please enter a valid MetaMask wallet address"
          />
          <p className="mt-1 text-xs text-gray-500">Enter the recipient's MetaMask wallet address (starts with 0x)</p>
        </div>

        {amountINR && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-gray-900">₹{parseFloat(amountINR).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform Fee (0.5%):</span>
              <span className="font-semibold text-gray-900">₹{amounts.platformFee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Blockchain Fee:</span>
              <span className="font-semibold text-gray-900">≈ $0.05</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total Cost:</span>
                <span className="font-bold text-gray-900 text-lg">₹{amounts.totalCost}</span>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !exchangeRate || profile?.kyc_status !== 'verified'}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Money
            </>
          )}
        </button>
      </form>
    </div>
  );
}
