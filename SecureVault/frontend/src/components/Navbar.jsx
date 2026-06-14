import { Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="glass border-b border-dark-700/50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-vault-600 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-semibold text-white">SecureVault</span>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-vault-600/30 rounded-full flex items-center justify-center text-vault-400 text-sm font-medium">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-dark-300 text-sm hidden sm:block">{user.name}</span>
        </div>
      )}
    </header>
  );
};

export default Navbar;
