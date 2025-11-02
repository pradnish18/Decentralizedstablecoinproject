import { useState, useEffect } from 'react';
import { Shield, Upload, CheckCircle, AlertCircle, Loader, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function KYCVerification() {
  const { user, profile, refreshProfile } = useAuth();
  const [documentType, setDocumentType] = useState('aadhaar');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  // Real-time subscription for KYC status updates
  useEffect(() => {
    if (!user) return;

    // Set initial status
    setKycStatus(profile?.kyc_status || null);

    // Subscribe to profile changes for real-time KYC updates
    const profileSubscription = supabase
      .channel('profile-kyc-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const updatedProfile = payload.new as any;
          setKycStatus(updatedProfile.kyc_status);
          refreshProfile();
        }
      )
      .subscribe();

    // Subscribe to KYC document changes
    const kycSubscription = supabase
      .channel('kyc-document-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kyc_documents',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refreshProfile();
        }
      )
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
      kycSubscription.unsubscribe();
    };
  }, [user, profile?.kyc_status, refreshProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Please sign in to complete KYC');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: docError } = await supabase
        .from('kyc_documents')
        .insert({
          user_id: user.id,
          document_type: documentType,
          document_number: documentNumber,
          verification_status: 'pending',
        });

      if (docError) throw docError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'pending',
          kyc_submitted_at: new Date().toISOString(),
          phone_number: phoneNumber,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();
      setSuccess(true);
      setDocumentNumber('');
      setPhoneNumber('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Show pending status with real-time updates
  if (profile?.kyc_status === 'pending' || kycStatus === 'pending') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-yellow-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">KYC Pending Verification</h3>
          <p className="text-gray-600 mb-4">Your documents are being reviewed</p>
          <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            Status: Under Review
          </div>
          <p className="mt-4 text-sm text-gray-500">
            This usually takes 24-48 hours. You'll be notified once verified.
          </p>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 justify-center text-sm text-blue-800">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Real-time updates enabled - status will update automatically</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profile?.kyc_status === 'verified') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">KYC Verified</h3>
          <p className="text-gray-600 mb-4">Your account has been successfully verified</p>
          <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Verified on {new Date(profile.kyc_verified_at!).toLocaleDateString('en-IN')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">KYC Verification</h3>
          <p className="text-sm text-gray-600">Complete verification to start sending money</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Why KYC is Required</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Compliance with Indian financial regulations</li>
          <li>• Prevents fraud and money laundering</li>
          <li>• Protects your account and transactions</li>
          <li>• Required for cross-border remittances</li>
        </ul>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">KYC Submitted Successfully!</p>
            <p className="text-sm text-green-700">Your account is now verified</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="aadhaar">Aadhaar Card</option>
            <option value="pan">PAN Card</option>
            <option value="passport">Passport</option>
            <option value="drivers_license">Driver's License</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Number
          </label>
          <input
            type="text"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={
              documentType === 'aadhaar'
                ? '1234 5678 9012'
                : documentType === 'pan'
                ? 'ABCDE1234F'
                : 'Enter document number'
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+91 98765 43210"
            required
          />
        </div>

        <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Document Upload</p>
          <p className="text-xs text-gray-500">
            For demo purposes, document upload is simulated
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Submit KYC
            </>
          )}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500 text-center">
        Your information is encrypted and stored securely. We comply with all data protection regulations.
      </p>
    </div>
  );
}
