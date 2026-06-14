import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import PasswordStrength from './PasswordStrength';
import PasswordGenerator from './PasswordGenerator';

const categories = ['social', 'finance', 'work', 'shopping', 'entertainment', 'other'];

const AddPassword = ({ isOpen, onClose, onSuccess, editEntry }) => {
  const [form, setForm] = useState({
    websiteName: '',
    websiteUrl: '',
    username: '',
    password: '',
    notes: '',
    category: 'other',
    expiryDate: '',
  });
  const [strength, setStrength] = useState(0);
  const [showGenerator, setShowGenerator] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editEntry) {
      setForm({
        websiteName: editEntry.websiteName || '',
        websiteUrl: editEntry.websiteUrl || '',
        username: editEntry.username || '',
        password: '',
        notes: editEntry.notes || '',
        category: editEntry.category || 'other',
        expiryDate: editEntry.expiryDate ? editEntry.expiryDate.split('T')[0] : '',
      });
      setStrength(editEntry.strength || 0);
    } else {
      setForm({ websiteName: '', websiteUrl: '', username: '', password: '', notes: '', category: 'other', expiryDate: '' });
      setStrength(0);
    }
  }, [editEntry, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') {
      const s = value.length >= 16 ? 80 : value.length >= 12 ? 60 : value.length >= 8 ? 40 : 20;
      setStrength(s);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password && editEntry) delete payload.password;
      if (!payload.expiryDate) delete payload.expiryDate;

      let data;
      if (editEntry) {
        ({ data } = await api.put(`/password/${editEntry.id}`, payload));
      } else {
        ({ data } = await api.post('/password', payload));
      }

      if (data.breachWarning?.breached) {
        toast.error(data.breachWarning.message, { duration: 5000 });
      }

      toast.success(editEntry ? 'Password updated' : 'Password saved');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {editEntry ? 'Edit Password' : 'Add Password'}
            </h2>
            <button onClick={onClose} className="text-dark-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-dark-400 mb-1 block">Website Name *</label>
              <input name="websiteName" value={form.websiteName} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-400 mb-1 block">Website URL</label>
              <input name="websiteUrl" value={form.websiteUrl} onChange={handleChange} className="input-field" placeholder="example.com" />
            </div>
            <div>
              <label className="text-sm text-dark-400 mb-1 block">Username *</label>
              <input name="username" value={form.username} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-400 mb-1 block">
                Password {editEntry ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required={!editEntry}
                className="input-field font-mono"
              />
              {form.password && <div className="mt-2"><PasswordStrength strength={strength} /></div>}
              <button type="button" onClick={() => setShowGenerator(!showGenerator)} className="text-vault-400 text-sm mt-2 hover:underline">
                {showGenerator ? 'Hide Generator' : 'Use Password Generator'}
              </button>
            </div>
            {showGenerator && (
              <PasswordGenerator onSelect={(pwd) => { setForm((p) => ({ ...p, password: pwd })); setShowGenerator(false); }} />
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-dark-400 mb-1 block">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="input-field">
                  {categories.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-dark-400 mb-1 block">Expiry Date</label>
                <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-sm text-dark-400 mb-1 block">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="input-field resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving...' : editEntry ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddPassword;
