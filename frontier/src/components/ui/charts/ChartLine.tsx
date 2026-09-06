import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions, ScriptableContext } from 'chart.js';
import { commonOptions, createGradient } from './ChartUtils';
import BaseChart from './BaseChart';

interface ChartLineProps {
  data: ChartData<'line'>;
  height?: number;
  title?: string;
  isDarkMode?: boolean;
  options?: ChartOptions<'line'>;
}

const ChartLine: React.FC<ChartLineProps> = ({ data, height, title, isDarkMode = false, options }) => {
  const defaultOpts = commonOptions(isDarkMode);

  // Merge custom options
  const finalOptions: ChartOptions<'line'> = {
    ...defaultOpts,
    ...options,
    plugins: {
      ...defaultOpts.plugins,
      ...options?.plugins,
    },
    scales: {
      ...defaultOpts.scales,
      ...options?.scales,
    },
  };

  // Enhance data with gradients if fill is true
  const enhancedData: ChartData<'line'> = {
    ...data,
    datasets: data.datasets.map(ds => ({
        ...ds,
        backgroundColor: ((context: ScriptableContext<'line'>) => {
            if (ds.fill && typeof ds.borderColor === 'string') {
                 const ctx = context.chart.ctx;
                 // Cast to any to avoid strict CanvasGradient vs Color type issues in Chart.js types
                 return createGradient(ctx, ds.borderColor as string) as any;
            }
            return ds.backgroundColor;
        }) as any,
        // Ensure point styles if not provided
        pointBackgroundColor: ds.borderColor,
        pointBorderColor: isDarkMode ? '#151518' : '#ffffff',
        pointBorderWidth: 2,
    }))
  };

  return (
    <BaseChart height={height} title={title}>
      <Line data={enhancedData} options={finalOptions} />
    </BaseChart>
  );
};

export default ChartLine;