import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Smartphone, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

const Verify2FA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verify2FA } = useAuth();
  const { tempToken, methods, phone } = location.state || {};

  const [otp, setOtp] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [method, setMethod] = useState(methods?.whatsapp ? 'whatsapp' : 'authenticator');
  const [useBackup, setUseBackup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  if (!tempToken) {
    navigate('/login');
    return null;
  }

  const sendWhatsAppOtp = async () => {
    setSendingOtp(true);
    try {
      await api.post('/auth/send-whatsapp-otp', { token: tempToken });
      toast.success('OTP sent to your WhatsApp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verify2FA(tempToken, otp, method, useBackup ? backupCode : undefined);
      toast.success('Verification successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-vault-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Two-Factor Authentication</h1>
          <p className="text-dark-400 mt-1">Enter your verification code</p>
        </div>

        {methods?.authenticator && methods?.whatsapp && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMethod('authenticator')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                method === 'authenticator' ? 'bg-vault-600/20 text-vault-400 border border-vault-500/30' : 'bg-dark-800 text-dark-400'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Authenticator
            </button>
            <button
              onClick={() => setMethod('whatsapp')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                method === 'whatsapp' ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-dark-800 text-dark-400'
              }`}
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          </div>
        )}

        {method === 'whatsapp' && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
            <p className="text-green-400 text-sm">OTP will be sent to {phone || 'your WhatsApp'}</p>
            <button onClick={sendWhatsAppOtp} disabled={sendingOtp} className="text-green-400 text-sm mt-2 hover:underline">
              {sendingOtp ? 'Sending...' : 'Send OTP to WhatsApp'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!useBackup ? (
            <div>
              <label className="text-sm text-dark-400 mb-1 block">
                {method === 'whatsapp' ? 'WhatsApp OTP Code' : 'Authenticator Code'}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="000000"
                autoFocus
              />
            </div>
          ) : (
            <div>
              <label className="text-sm text-dark-400 mb-1 block">Backup Recovery Code</label>
              <input
                type="text"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                required
                className="input-field font-mono text-center"
                placeholder="XXXX-XXXX"
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <button
          onClick={() => setUseBackup(!useBackup)}
          className="text-vault-400 text-sm mt-4 w-full text-center hover:underline"
        >
          {useBackup ? 'Use OTP instead' : 'Use backup recovery code'}
        </button>
      </motion.div>
    </div>
  );
};

export default Verify2FA;
