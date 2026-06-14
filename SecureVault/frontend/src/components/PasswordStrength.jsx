import { getStrengthBarColor, getStrengthLabel, getStrengthColor } from '../utils/securityScore';

const PasswordStrength = ({ strength = 0, showLabel = true }) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        {showLabel && (
          <span className={`text-xs font-medium ${getStrengthColor(strength)}`}>
            {getStrengthLabel(strength)}
          </span>
        )}
        <span className="text-xs text-dark-400">{strength}%</span>
      </div>
      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getStrengthBarColor(strength)}`}
          style={{ width: `${strength}%` }}
        />
      </div>
    </div>
  );
};

export default PasswordStrength;
