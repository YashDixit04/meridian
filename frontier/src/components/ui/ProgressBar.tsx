import React from 'react';

export type ProgressBarColor = 'primary' | 'success' | 'danger' | 'info' | 'warning' | 'grey';

interface ProgressBarProps {
  percentage: number;
  color?: ProgressBarColor;
  className?: string;
  showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = 'primary',
  className = '',
  showLabel = false,
}) => {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    danger: 'bg-danger',
    info: 'bg-info',
    warning: 'bg-warning',
    grey: 'bg-grey-500',
  };

  return (
    <div className={`w-full flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-1.5 bg-grey-100 dark:bg-grey-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-grey-500 w-8 text-right">
          {Math.round(clampedPercentage)}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;