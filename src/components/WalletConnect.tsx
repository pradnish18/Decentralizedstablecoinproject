import { Wallet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export function WalletConnect() {
  const { account, isConnecting, error, connectWallet, switchToPolygon } = useWallet();
  const { user, profile, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (account && user && profile && account !== profile.wallet_address) {
      handleSaveWallet();
    }
  }, [account, user, profile]);

  const handleSaveWallet = async () => {
    if (!account || !user) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ wallet_address: account })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: walletError } = await supabase
        .from('wallets')
        .upsert({
          user_id: user.id,
          wallet_address: account,
          wallet_type: 'metamask',
          is_primary: true,
          balance_usdc: 0,
          balance_inr: 0,
        }, {
          onConflict: 'wallet_address',
        });

      if (walletError) throw walletError;

      await refreshProfile();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save wallet');
    } finally {
      setIsSaving(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Wallet className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Wallet Connection</h3>
          <p className="text-sm text-gray-600">Connect MetaMask to receive payments</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{saveError}</p>
        </div>
      )}

      {account ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-900">Connected Wallet</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-lg font-mono font-semibold text-green-900">{formatAddress(account)}</p>
          </div>

          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Saving wallet address...</span>
            </div>
          )}

          <button
            onClick={switchToPolygon}
            className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Switch to Polygon Network
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Connect MetaMask
            </>
          )}
        </button>
      )}

      <p className="mt-4 text-xs text-gray-500 text-center">
        Don't have MetaMask?{' '}
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Install it here
        </a>
      </p>
    </div>
  );
}
