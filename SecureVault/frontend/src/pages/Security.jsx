import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Monitor, Globe } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';

const actionLabels = {
  login: 'Login',
  logout: 'Logout',
  password_created: 'Password Created',
  password_viewed: 'Password Viewed',
  password_updated: 'Password Updated',
  password_deleted: 'Password Deleted',
  export: 'Data Export',
  '2fa_enabled': '2FA Enabled',
  '2fa_disabled': '2FA Disabled',
  login_failed: 'Login Failed',
};

const actionColors = {
  login: 'text-green-400 bg-green-500/10',
  logout: 'text-dark-400 bg-dark-700/50',
  password_created: 'text-vault-400 bg-vault-500/10',
  password_viewed: 'text-blue-400 bg-blue-500/10',
  password_updated: 'text-yellow-400 bg-yellow-500/10',
  password_deleted: 'text-red-400 bg-red-500/10',
  login_failed: 'text-red-400 bg-red-500/10',
  '2fa_enabled': 'text-green-400 bg-green-500/10',
  '2fa_disabled': 'text-orange-400 bg-orange-500/10',
};

const Security = () => {
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [logsRes, historyRes] = await Promise.all([
          api.get('/security/logs'),
          api.get('/security/history'),
        ]);
        setLogs(logsRes.data.logs);
        setHistory(historyRes.data.history);
      } catch {
        setLogs([]);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Security Center</h1>
        <p className="text-dark-400 mt-1">Monitor your account activity and login history</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-vault-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-vault-400" />
              <h2 className="text-lg font-semibold text-white">Login History</h2>
            </div>
            {history.length === 0 ? (
              <p className="text-dark-400 text-sm">No login history yet</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {history.map((h) => (
                  <div key={h.id} className="p-3 bg-dark-800/50 rounded-xl border border-dark-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${h.success ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                        {h.success ? 'Success' : 'Failed'}
                      </span>
                      <span className="text-xs text-dark-400">{formatDate(h.date)} {formatTime(h.time)}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-dark-300">
                        <Monitor className="w-3.5 h-3.5 text-dark-500" />
                        {h.browser} — {h.device}
                      </div>
                      <div className="flex items-center gap-2 text-dark-400">
                        <Globe className="w-3.5 h-3.5 text-dark-500" />
                        {h.ipAddress}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-vault-400" />
              <h2 className="text-lg font-semibold text-white">Security Logs</h2>
            </div>
            {logs.length === 0 ? (
              <p className="text-dark-400 text-sm">No security events yet</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl border border-dark-700/50">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-lg ${actionColors[log.action] || 'text-dark-400 bg-dark-700/50'}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                      {log.details && <span className="text-xs text-dark-400">{log.details}</span>}
                    </div>
                    <span className="text-xs text-dark-500">{formatTime(log.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Security;
