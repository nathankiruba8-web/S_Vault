import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, subtitle, color = 'vault' }) => {
  const colors = {
    vault: 'from-vault-600/20 to-vault-800/10 border-vault-500/30 text-vault-400',
    green: 'from-green-600/20 to-green-800/10 border-green-500/30 text-green-400',
    yellow: 'from-yellow-600/20 to-yellow-800/10 border-yellow-500/30 text-yellow-400',
    red: 'from-red-600/20 to-red-800/10 border-red-500/30 text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card bg-gradient-to-br ${colors[color]} border`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-dark-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-dark-800/50`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
