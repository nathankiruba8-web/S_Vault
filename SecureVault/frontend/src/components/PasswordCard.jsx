import { useState } from 'react';
import { Eye, EyeOff, Copy, ExternalLink, Trash2, Edit, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import PasswordStrength from './PasswordStrength';

const PasswordCard = ({ entry, onEdit, onDelete }) => {
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const reveal = async () => {
    if (visible) {
      setVisible(false);
      setPassword('');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/password/${entry.id}`);
      setPassword(data.password.password);
      setVisible(true);
    } catch {
      toast.error('Failed to reveal password');
    } finally {
      setLoading(false);
    }
  };

  const copyField = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const categoryColors = {
    social: 'bg-blue-500/20 text-blue-400',
    finance: 'bg-green-500/20 text-green-400',
    work: 'bg-purple-500/20 text-purple-400',
    shopping: 'bg-orange-500/20 text-orange-400',
    entertainment: 'bg-pink-500/20 text-pink-400',
    other: 'bg-dark-600/50 text-dark-300',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card hover:border-vault-500/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-vault-600/20 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-vault-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{entry.websiteName}</h3>
            {entry.websiteUrl && (
              <a
                href={entry.websiteUrl.startsWith('http') ? entry.websiteUrl : `https://${entry.websiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-vault-400 hover:underline flex items-center gap-1"
              >
                {entry.websiteUrl} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-lg capitalize ${categoryColors[entry.category]}`}>
          {entry.category}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between bg-dark-800/50 rounded-lg px-3 py-2">
          <div>
            <p className="text-xs text-dark-400">Username</p>
            <p className="text-sm text-dark-200">{entry.username}</p>
          </div>
          <button onClick={() => copyField(entry.username, 'Username')} className="text-dark-400 hover:text-vault-400">
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-dark-800/50 rounded-lg px-3 py-2">
          <div className="flex-1">
            <p className="text-xs text-dark-400">Password</p>
            <p className="text-sm font-mono text-dark-200">
              {visible ? password : '••••••••••••'}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={reveal} disabled={loading} className="text-dark-400 hover:text-vault-400">
              {loading ? (
                <div className="w-4 h-4 border border-vault-400 border-t-transparent rounded-full animate-spin" />
              ) : visible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            {visible && (
              <button onClick={() => copyField(password, 'Password')} className="text-dark-400 hover:text-vault-400">
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <PasswordStrength strength={entry.strength} showLabel={false} />
      </div>

      {entry.notes && (
        <p className="text-xs text-dark-400 mt-3 italic">{entry.notes}</p>
      )}

      <div className="flex gap-2 mt-4 pt-4 border-t border-dark-700/50">
        <button onClick={() => onEdit(entry)} className="btn-secondary flex-1 text-sm py-2 flex items-center justify-center gap-2">
          <Edit className="w-4 h-4" /> Edit
        </button>
        <button onClick={() => onDelete(entry.id)} className="btn-secondary flex-1 text-sm py-2 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 border-red-500/30">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </motion.div>
  );
};

export default PasswordCard;
