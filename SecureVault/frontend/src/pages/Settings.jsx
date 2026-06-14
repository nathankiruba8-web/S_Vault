import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, MessageCircle, User, Phone, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

const Settings = () => {
  const { user, updateUser, fetchUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [otp, setOtp] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [backupCodes, setBackupCodes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const setupAuthenticator = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/setup-2fa', { method: 'authenticator' });
      setQrCode(data.qrCode);
      setSecret(data.secret);
      toast.success('Scan the QR code with Google Authenticator');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const confirmAuthenticator = async () => {
    if (!otp) return toast.error('Enter OTP code');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/confirm-2fa', { otp });
      setBackupCodes(data.backupCodes);
      setQrCode(null);
      setSecret(null);
      setOtp('');
      await fetchUser();
      toast.success('Authenticator 2FA enabled!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const enableWhatsApp = async () => {
    if (!profile.phone && !user?.phone) {
      return toast.error('Add phone number in profile first');
    }
    setLoading(true);
    try {
      await api.post('/auth/setup-2fa', { method: 'whatsapp' });
      await fetchUser();
      toast.success('WhatsApp 2FA enabled!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enable WhatsApp 2FA');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async (method) => {
    const code = prompt(`Enter your ${method === 'whatsapp' ? 'authenticator' : ''} OTP to disable ${method} 2FA:`);
    if (!code) return;
    setLoading(true);
    try {
      await api.post('/auth/disable-2fa', { otp: code, method });
      await fetchUser();
      toast.success(`${method} 2FA disabled`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disable');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    toast.success('Backup codes copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-dark-400 mt-1">Manage your profile and security preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-vault-400" />
            <h2 className="text-lg font-semibold text-white">Profile</h2>
          </div>
          <div>
            <label className="text-sm text-dark-400 mb-1 block">Name</label>
            <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="text-sm text-dark-400 mb-1 block">Email</label>
            <input value={user?.email || ''} disabled className="input-field opacity-60" />
          </div>
          <div>
            <label className="text-sm text-dark-400 mb-1 block">Phone (WhatsApp)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="input-field pl-11" placeholder="+1234567890" />
            </div>
          </div>
          <button onClick={saveProfile} disabled={loading} className="btn-primary">Save Profile</button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-vault-400" />
            <h2 className="text-lg font-semibold text-white">Two-Factor Authentication</h2>
          </div>

          <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-vault-400" />
                <div>
                  <p className="text-white font-medium">Google Authenticator</p>
                  <p className="text-dark-400 text-sm">
                    {user?.twoFactorMethod === 'authenticator' || user?.twoFactorMethod === 'both' ? 'Enabled' : 'Not enabled'}
                  </p>
                </div>
              </div>
              {user?.twoFactorMethod === 'authenticator' || user?.twoFactorMethod === 'both' ? (
                <button onClick={() => disable2FA('authenticator')} className="btn-secondary text-sm text-red-400">Disable</button>
              ) : !qrCode ? (
                <button onClick={setupAuthenticator} disabled={loading} className="btn-primary text-sm">Setup</button>
              ) : null}
            </div>

            {qrCode && (
              <div className="mt-4 space-y-3">
                <img src={qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48 rounded-xl" />
                <p className="text-xs text-dark-400 text-center font-mono">{secret}</p>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="input-field text-center font-mono tracking-widest"
                />
                <button onClick={confirmAuthenticator} disabled={loading} className="btn-primary w-full">Verify & Enable</button>
              </div>
            )}
          </div>

          <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">WhatsApp 2FA</p>
                  <p className="text-dark-400 text-sm">
                    {user?.whatsapp2FAEnabled ? `Enabled (${user?.phone})` : 'Not enabled'}
                  </p>
                </div>
              </div>
              {user?.whatsapp2FAEnabled ? (
                <button onClick={() => disable2FA('whatsapp')} className="btn-secondary text-sm text-red-400">Disable</button>
              ) : (
                <button onClick={enableWhatsApp} disabled={loading} className="btn-primary text-sm bg-green-600 hover:bg-green-500">Enable</button>
              )}
            </div>
          </div>

          {backupCodes && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-yellow-400 font-medium mb-2">Save your backup codes!</p>
              <p className="text-dark-400 text-sm mb-3">Store these codes safely. Each can only be used once.</p>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm text-dark-200 mb-3">
                {backupCodes.map((code) => (
                  <span key={code} className="bg-dark-800 px-2 py-1 rounded">{code}</span>
                ))}
              </div>
              <button onClick={copyBackupCodes} className="btn-secondary text-sm flex items-center gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy Codes
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
