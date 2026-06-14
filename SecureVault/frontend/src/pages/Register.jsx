import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-vault-600/5 via-transparent to-vault-800/5" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-vault-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-dark-400 mt-1">Start securing your passwords today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-dark-400 mb-1 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input name="name" value={form.name} onChange={handleChange} required className="input-field pl-11" />
            </div>
          </div>
          <div>
            <label className="text-sm text-dark-400 mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field pl-11" />
            </div>
          </div>
          <div>
            <label className="text-sm text-dark-400 mb-1 block">Phone (for WhatsApp 2FA)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="input-field pl-11" placeholder="+1234567890" />
            </div>
          </div>
          <div>
            <label className="text-sm text-dark-400 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required minLength={8} className="input-field pl-11 pr-11" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-dark-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-vault-400 hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
