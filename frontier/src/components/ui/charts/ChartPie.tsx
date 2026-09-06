import React from 'react';
import { Doughnut, Pie } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { commonOptions } from './ChartUtils';
import BaseChart from './BaseChart';

import { TooltipProps } from '../Tooltip';

interface ChartPieProps {
  data: ChartData<'doughnut'>; // compatible with pie
  height?: number;
  type?: 'pie' | 'doughnut';
  title?: React.ReactNode;
  isDarkMode?: boolean;
  cutout?: string | number; // For doughnut thickness
  action?: React.ReactNode;
  actionTooltip?: string;
  actionTooltipPosition?: TooltipProps['position'];
}

const ChartPie: React.FC<ChartPieProps> = ({ 
    data, 
    height = 300, 
    type = 'doughnut', 
    title, 
    isDarkMode = false,
    cutout,
    action,
    actionTooltip,
    actionTooltipPosition,
}) => {
  const defaultOpts = commonOptions(isDarkMode);

  const finalOptions: ChartOptions<'doughnut'> = {
    ...defaultOpts,
    cutout: type === 'doughnut' ? (cutout || '70%') : 0,
    scales: {
        x: { display: false },
        y: { display: false }
    },
    plugins: {
        ...defaultOpts.plugins,
        legend: {
            ...defaultOpts.plugins?.legend,
            position: 'right',
            align: 'center',
            labels: {
                ...defaultOpts.plugins?.legend?.labels,
                usePointStyle: true,
                padding: 20,
            }
        }
    },
    elements: {
        arc: {
            borderWidth: 2,
            borderColor: isDarkMode ? '#151518' : '#ffffff',
        }
    }
  };

  const ChartComponent = type === 'pie' ? Pie : Doughnut;

  return (
    <BaseChart 
      height={height} 
      title={title} 
      action={action} 
      actionTooltip={actionTooltip}
      actionTooltipPosition={actionTooltipPosition}
    >
      {/* Cast data to any to avoid ChartData<'doughnut'> vs ChartData<'pie'> mismatch, as they are structurally compatible for this use case */}
      <ChartComponent data={data as any} options={finalOptions as any} />
    </BaseChart>
  );
};

export default ChartPie;