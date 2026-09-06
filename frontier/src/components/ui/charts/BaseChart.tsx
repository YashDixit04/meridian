import React from 'react';
import Tooltip, { TooltipProps } from '../Tooltip';

interface BaseChartProps {
  children: React.ReactNode;
  height?: number;
  className?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  actionTooltip?: string;
  actionTooltipPosition?: TooltipProps['position'];
}

const BaseChart: React.FC<BaseChartProps> = ({ 
  children, 
  height = 300, 
  className = '', 
  title, 
  action,
  actionTooltip,
  actionTooltipPosition = 'left'
}) => {
  return (
    <div className={`w-full bg-white dark:bg-[#151518] rounded-xl border border-grey-200 p-6 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          {title && (
            typeof title === 'string' ? (
              <h4 className="text-sm font-semibold text-grey-900 dark:text-white">
                {title}
              </h4>
            ) : (
              title
            )
          )}
          {action && (
            actionTooltip ? (
              <Tooltip content={actionTooltip} position={actionTooltipPosition}>
                <div>{action}</div>
              </Tooltip>
            ) : (
              <div>{action}</div>
            )
          )}
        </div>
      )}
      <div className="relative w-full" style={{ height }}>
        {children}
      </div>
    </div>
  );
};

export default BaseChart;