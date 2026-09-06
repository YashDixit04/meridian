import React from 'react';
import { Bubble } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { commonOptions } from './ChartUtils';
import BaseChart from './BaseChart';

interface ChartBubbleProps {
  data: ChartData<'bubble'>;
  height?: number;
  title?: string;
  isDarkMode?: boolean;
}

const ChartBubble: React.FC<ChartBubbleProps> = ({ data, height, title, isDarkMode = false }) => {
  const defaultOpts = commonOptions(isDarkMode);

  const finalOptions: ChartOptions<'bubble'> = {
    ...defaultOpts,
    scales: {
      x: {
        ...defaultOpts.scales?.x,
        grid: {
            ...defaultOpts.scales?.x?.grid,
            display: true
        }
      },
      y: {
        ...defaultOpts.scales?.y,
        grid: {
             ...defaultOpts.scales?.y?.grid,
             display: true
        }
      }
    }
  };

  return (
    <BaseChart height={height} title={title}>
      <Bubble data={data} options={finalOptions} />
    </BaseChart>
  );
};

export default ChartBubble;