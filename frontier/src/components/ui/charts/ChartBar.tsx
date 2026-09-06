import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { commonOptions } from './ChartUtils';
import BaseChart from './BaseChart';

interface ChartBarProps {
  data: ChartData<'bar'>;
  height?: number;
  horizontal?: boolean;
  stacked?: boolean;
  title?: string;
  isDarkMode?: boolean;
  options?: ChartOptions<'bar'>;
}

const ChartBar: React.FC<ChartBarProps> = ({ 
    data, 
    height, 
    horizontal = false, 
    stacked = false, 
    title, 
    isDarkMode = false, 
    options 
}) => {
  const defaultOpts = commonOptions(isDarkMode);

  const finalOptions: ChartOptions<'bar'> = {
    ...defaultOpts,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      ...defaultOpts.plugins,
      legend: {
          ...defaultOpts.plugins?.legend,
          display: data.datasets.length > 1 // Hide legend if only 1 dataset usually
      }
    },
    scales: {
      x: {
        ...defaultOpts.scales?.x,
        stacked: stacked,
        grid: {
            ...defaultOpts.scales?.x?.grid,
            display: !horizontal, // Hide vertical grid lines for horizontal bars usually
        }
      },
      y: {
        ...defaultOpts.scales?.y,
        stacked: stacked,
        grid: {
            ...defaultOpts.scales?.y?.grid,
            display: horizontal, 
        }
      },
    },
    ...options,
  };

  return (
    <BaseChart height={height} title={title}>
      <Bar data={data} options={finalOptions} />
    </BaseChart>
  );
};

export default ChartBar;