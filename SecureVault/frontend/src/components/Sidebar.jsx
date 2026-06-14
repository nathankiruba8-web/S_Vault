import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, KeyRound, Shield, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vault', icon: KeyRound, label: 'Vault' },
  { to: '/security', icon: Shield, label: 'Security' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navContent = (
    <>
      <nav className="flex-1 space-y-1 p-4">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-dark-700/50">
        <button onClick={handleLogout} className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-lg"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className="hidden lg:flex flex-col w-64 glass border-r border-dark-700/50 min-h-[calc(100vh-65px)]">
        {navContent}
      </aside>

      {open && (
        <aside className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-64 glass flex flex-col min-h-full mt-16">
            {navContent}
          </div>
        </aside>
      )}
    </>
  );
};

export default Sidebar;
