import { useEffect, useState } from 'react';
import { TrendingUp, Send, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Stats = {
  totalSent: number;
  totalTransactions: number;
  averageAmount: number;
  completedTransactions: number;
};

export function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalSent: 0,
    totalTransactions: 0,
    averageAmount: 0,
    completedTransactions: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('amount_inr, status')
      .eq('sender_id', user.id);

    if (data && !error) {
      const totalSent = data.reduce((sum, tx) => sum + tx.amount_inr, 0);
      const completedTransactions = data.filter((tx) => tx.status === 'completed').length;
      const averageAmount = data.length > 0 ? totalSent / data.length : 0;

      setStats({
        totalSent,
        totalTransactions: data.length,
        averageAmount,
        completedTransactions,
      });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'User'}!
          </h2>
          <p className="text-gray-600 mt-1">Here's an overview of your remittance activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Sent</p>
          <p className="text-3xl font-bold">₹{stats.totalSent.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Send className="w-6 h-6" />
            </div>
          </div>
          <p className="text-green-100 text-sm mb-1">Total Transactions</p>
          <p className="text-3xl font-bold">{stats.totalTransactions}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-purple-100 text-sm mb-1">Average Amount</p>
          <p className="text-3xl font-bold">₹{stats.averageAmount.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-orange-100 text-sm mb-1">Completed</p>
          <p className="text-3xl font-bold">{stats.completedTransactions}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg p-8 text-white">
        <div className="max-w-3xl">
          <h3 className="text-2xl font-bold mb-3">Why Choose Our Platform?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <div className="text-4xl font-bold mb-2">&lt;1%</div>
              <p className="text-blue-100">Transaction Fee</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">60-120s</div>
              <p className="text-blue-100">Transfer Time</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-blue-100">Always Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
