import React from 'react';

export type ProgressCircleColor = 'primary' | 'success' | 'danger' | 'info' | 'warning';

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: ProgressCircleColor;
  showLabel?: boolean;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  size = 60,
  strokeWidth = 4,
  color = 'primary',
  showLabel = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: 'text-primary',
    success: 'text-success',
    danger: 'text-danger',
    info: 'text-info',
    warning: 'text-warning',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          className="text-grey-100 dark:text-grey-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className={`${colorClasses[color]} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-xs font-medium text-grey-700 dark:text-grey-300">
          {percentage}%
        </span>
      )}
    </div>
  );
};

export default ProgressCircle;