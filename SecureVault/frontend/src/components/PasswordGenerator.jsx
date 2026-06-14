import { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import PasswordStrength from './PasswordStrength';

const PasswordGenerator = ({ onSelect }) => {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [options, setOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/password/generate', options);
      setPassword(data.password);
      setStrength(data.strength);
      if (data.breachWarning?.breached) {
        toast.error('Generated password found in breaches. Regenerating recommended.');
      }
    } catch {
      toast.error('Failed to generate password');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(password);
    toast.success('Copied to clipboard');
  };

  const toggle = (key) => setOptions((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="glass-card space-y-4">
      <h3 className="text-lg font-semibold text-white">Password Generator</h3>

      <div className="flex gap-2">
        <input
          readOnly
          value={password}
          placeholder="Click generate"
          className="input-field flex-1 font-mono text-sm"
        />
        <button onClick={copy} disabled={!password} className="btn-secondary px-3">
          <Copy className="w-4 h-4" />
        </button>
        <button onClick={generate} disabled={loading} className="btn-primary px-3">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {password && <PasswordStrength strength={strength} />}

      <div className="space-y-3">
        <div>
          <label className="text-sm text-dark-400">Length: {options.length}</label>
          <input
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(e) => setOptions((prev) => ({ ...prev, length: parseInt(e.target.value) }))}
            className="w-full accent-vault-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'uppercase', label: 'Uppercase (A-Z)' },
            { key: 'lowercase', label: 'Lowercase (a-z)' },
            { key: 'numbers', label: 'Numbers (0-9)' },
            { key: 'symbols', label: 'Symbols (!@#)' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => toggle(key)}
                className="accent-vault-500 rounded"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {onSelect && password && (
        <button onClick={() => onSelect(password)} className="btn-primary w-full">
          Use This Password
        </button>
      )}
    </div>
  );
};

export default PasswordGenerator;
