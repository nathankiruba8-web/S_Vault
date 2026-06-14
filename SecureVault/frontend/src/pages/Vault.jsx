import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import PasswordCard from '../components/PasswordCard';
import AddPassword from '../components/AddPassword';
import api from '../api/axios';

const categories = ['all', 'social', 'finance', 'work', 'shopping', 'entertainment', 'other'];

const Vault = () => {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  const fetchPasswords = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      const { data } = await api.get('/password', { params });
      setPasswords(data.passwords);
    } catch {
      toast.error('Failed to load passwords');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchPasswords, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this password entry?')) return;
    try {
      await api.delete(`/password/${id}`);
      toast.success('Password deleted');
      fetchPasswords();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (entry) => {
    setEditEntry(entry);
    setShowAdd(true);
  };

  const handleClose = () => {
    setShowAdd(false);
    setEditEntry(null);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Password Vault</h1>
          <p className="text-dark-400 mt-1">{passwords.length} saved passwords</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Password
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search passwords..."
            className="input-field pl-11"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field pl-11 pr-8 appearance-none min-w-[160px] capitalize"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-vault-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : passwords.length === 0 ? (
        <div className="glass-card text-center py-16">
          <p className="text-dark-400 mb-4">No passwords found</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">Add your first password</button>
        </div>
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {passwords.map((entry) => (
              <PasswordCard key={entry.id} entry={entry} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AddPassword
        isOpen={showAdd}
        onClose={handleClose}
        onSuccess={fetchPasswords}
        editEntry={editEntry}
      />
    </DashboardLayout>
  );
};

export default Vault;
