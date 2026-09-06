import React from 'react';
import { Radar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { commonOptions, getThemeColors } from './ChartUtils';
import BaseChart from './BaseChart';

interface ChartRadarProps {
  data: ChartData<'radar'>;
  height?: number;
  title?: string;
  isDarkMode?: boolean;
}

const ChartRadar: React.FC<ChartRadarProps> = ({ data, height, title, isDarkMode = false }) => {
  const defaultOpts = commonOptions(isDarkMode);
  const theme = getThemeColors(isDarkMode);

  // Radar charts use 'r' scale, not x/y.
  // We strip x/y from defaultOpts by not spreading them into scales, or explicitly overwriting.
  
  const finalOptions: ChartOptions<'radar'> = {
    ...defaultOpts,
    scales: {
       // Reset x/y to undefined or just define r. Since defaultOpts is 'any', we effectively overwrite scales here.
       r: {
          angleLines: {
             color: theme.grid
          },
          grid: {
             color: theme.grid
          },
          pointLabels: {
             color: theme.text,
             font: { family: 'Inter', size: 11 }
          },
          ticks: {
             display: false, // hide scale numbers
             backdropColor: 'transparent'
          }
       }
    },
    elements: {
        line: { borderWidth: 2 },
        point: { radius: 3 }
    }
  };

  return (
    <BaseChart height={height} title={title}>
      <Radar data={data} options={finalOptions} />
    </BaseChart>
  );
};

export default ChartRadar;