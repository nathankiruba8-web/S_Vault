import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Shield, AlertTriangle, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import PasswordGenerator from '../components/PasswordGenerator';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/security/stats');
        setStats(data.stats);
      } catch {
        setStats({ passwordCount: 0, weakPasswords: 0, securityScore: 40, recentLogins: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="text-dark-400 mt-1">Your security dashboard overview</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-vault-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={KeyRound} title="Total Passwords" value={stats?.passwordCount || 0} color="vault" />
              <StatCard icon={Shield} title="Security Score" value={`${stats?.securityScore || 0}%`} color="green" />
              <StatCard icon={AlertTriangle} title="Weak Passwords" value={stats?.weakPasswords || 0} color={stats?.weakPasswords > 0 ? 'red' : 'green'} />
              <StatCard icon={Activity} title="Recent Logins" value={stats?.recentLogins || 0} subtitle="Last 30 days" color="vault" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <PasswordGenerator />
              <div className="glass-card space-y-4">
                <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/vault" className="block p-4 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-all border border-dark-700/50 hover:border-vault-500/30">
                    <div className="flex items-center gap-3">
                      <KeyRound className="w-5 h-5 text-vault-400" />
                      <div>
                        <p className="text-white font-medium">Manage Vault</p>
                        <p className="text-dark-400 text-sm">Add, edit, or search passwords</p>
                      </div>
                    </div>
                  </Link>
                  <Link to="/security" className="block p-4 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-all border border-dark-700/50 hover:border-vault-500/30">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-vault-400" />
                      <div>
                        <p className="text-white font-medium">Security Center</p>
                        <p className="text-dark-400 text-sm">View login history and logs</p>
                      </div>
                    </div>
                  </Link>
                  <Link to="/settings" className="block p-4 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-all border border-dark-700/50 hover:border-vault-500/30">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Setup 2FA</p>
                        <p className="text-dark-400 text-sm">
                          {user?.twoFactorEnabled ? '2FA is enabled' : 'Enable authenticator or WhatsApp 2FA'}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
