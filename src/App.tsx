import { useState } from 'react';
import { Globe, LogOut, Menu, X } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { WalletConnect } from './components/WalletConnect';
import { SendMoney } from './components/SendMoney';
import { TransactionHistory } from './components/TransactionHistory';
import { KYCVerification } from './components/KYCVerification';

function AppContent() {
  const { user, profile, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RemitChain</h1>
                <p className="text-xs text-gray-600">Decentralized Remittance Platform</p>
              </div>
            </div>

            {user ? (
              <>
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                    <p className="text-xs text-gray-600">
                      {profile?.kyc_status === 'verified' ? '✓ Verified' : 'Unverified'}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {mobileMenuOpen && user && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <div className="pb-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-600">
                  {profile?.kyc_status === 'verified' ? '✓ Verified' : 'Unverified'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <div className="text-center py-20">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="inline-block p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-6">
                  <Globe className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Send Money Globally, Instantly
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Fast, secure, and affordable cross-border payments using stablecoins on blockchain technology
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="text-3xl font-bold text-blue-600 mb-2">&lt;1%</div>
                  <div className="text-gray-900 font-semibold mb-1">Low Fees</div>
                  <p className="text-sm text-gray-600">Traditional services charge 5-10%</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="text-3xl font-bold text-green-600 mb-2">60-120s</div>
                  <div className="text-gray-900 font-semibold mb-1">Instant Transfer</div>
                  <p className="text-sm text-gray-600">Banks take 3-5 business days</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-gray-900 font-semibold mb-1">Always Available</div>
                  <p className="text-sm text-gray-600">No banking hours restrictions</p>
                </div>
              </div>

              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Get Started Now
              </button>

              <div className="mt-12 bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Sign Up & Verify KYC</div>
                      <p className="text-sm text-gray-600">Quick registration and identity verification</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Connect Your Wallet</div>
                      <p className="text-sm text-gray-600">Link MetaMask to receive USDC payments</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Send Money via UPI</div>
                      <p className="text-sm text-gray-600">Pay in INR, recipient gets USDC instantly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <Dashboard />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <SendMoney />
                <TransactionHistory />
              </div>

              <div className="space-y-8">
                {profile?.kyc_status !== 'verified' && <KYCVerification />}
                <WalletConnect />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>RemitChain</strong> - Decentralized Cross-Border Payment Platform
            </p>
            <p>Powered by Polygon blockchain • Secured by smart contracts • Built for financial inclusion</p>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
