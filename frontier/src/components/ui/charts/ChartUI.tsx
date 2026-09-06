import React from 'react';
import ChartLine from './ChartLine';
import ChartBar from './ChartBar';
import ChartPie from './ChartPie';
import ChartRadar from './ChartRadar';
import ChartBubble from './ChartBubble';
import { COLORS } from './ChartUtils';

interface ChartUIProps {
    isDarkMode: boolean;
}

const ChartUI: React.FC<ChartUIProps> = ({ isDarkMode }) => {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const shortLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // --- LINE DATA ---
  const lineDataSingle = {
    labels,
    datasets: [
      {
        label: 'Shipskart',
        data: [20, 45, 30, 50, 40, 60, 50, 65, 55, 70, 60, 65],
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
        fill: false,
      },
    ],
  };

  const lineDataMulti = {
    labels,
    datasets: [
      {
        label: 'Shipskart',
        data: [20, 40, 30, 50, 40, 60, 50, 70, 60, 50, 70, 60],
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
        fill: false,
      },
      {
        label: 'Bundle',
        data: [15, 25, 45, 30, 60, 35, 60, 40, 55, 45, 60, 55],
        borderColor: COLORS.success,
        backgroundColor: COLORS.success,
        fill: false,
      },
    ],
  };

  const lineDataDashed = {
    labels: labels.slice(0, 6),
    datasets: [
      {
        label: 'Current',
        data: [20, 40, 35, 50, 45, 60],
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
        fill: false,
      },
      {
        label: 'Projected',
        data: [60, 50, 65, 55, 70, 65], // Mock values continuing
        borderColor: COLORS.success,
        backgroundColor: COLORS.success,
        borderDash: [5, 5],
        fill: false,
      }
    ],
  };

  const lineDataArea = {
    labels,
    datasets: [
      {
        label: 'Growth',
        data: [30, 45, 35, 55, 45, 65, 60, 75, 65, 80, 70, 85],
        borderColor: COLORS.info,
        fill: true,
      },
    ],
  };

  // --- BAR DATA ---
  const barDataVertical = {
      labels: shortLabels,
      datasets: [
          {
              label: 'Shipskart',
              data: [40, 60, 55, 70, 60, 80, 75],
              backgroundColor: COLORS.primary,
          },
          {
              label: 'Bundle',
              data: [30, 50, 45, 60, 50, 70, 65],
              backgroundColor: COLORS.success,
          },
          {
            label: 'Other',
            data: [20, 30, 25, 40, 30, 50, 45],
            backgroundColor: COLORS.danger,
        }
      ]
  };

  const barDataStacked = {
    labels: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
    datasets: [
        { label: 'A', data: [45, 20, 15, 30, 35], backgroundColor: COLORS.primary },
        { label: 'B', data: [30, 35, 25, 15, 20], backgroundColor: COLORS.danger },
        { label: 'C', data: [25, 10, 5, 15, 20], backgroundColor: COLORS.warning },
    ]
  };

  const barDataHorizontal = {
      labels: ['A', 'B', 'C', 'D'],
      datasets: [
          {
              label: 'Value',
              data: [65, 45, 80, 55],
              backgroundColor: [COLORS.primary, COLORS.success, COLORS.info, COLORS.warning],
          }
      ]
  };
  
  // Floating Bars (Gantt-like)
  const barDataFloating = {
      labels: ['Design', 'Dev', 'QA', 'Deploy'],
      datasets: [
          {
              label: 'Phase 1',
              data: [
                  [1, 3], // Design: Day 1 to 3
                  [3, 6], // Dev: Day 3 to 6
                  [6, 8], // QA: Day 6 to 8
                  [8, 9]  // Deploy: Day 8 to 9
              ] as [number, number][],
              backgroundColor: COLORS.primary,
              barPercentage: 0.5,
          },
          {
              label: 'Phase 2',
              data: [
                [4, 6], // Design overlap
                [6, 9], // Dev
                [9, 10], // QA
                [10, 11] // Deploy
              ] as [number, number][],
              backgroundColor: COLORS.warning,
              barPercentage: 0.5,
          }
      ]
  };

  // --- PIE DATA ---
  const pieData = {
      labels: ['Shipskart', 'Bundle', 'Nest', 'Other'],
      datasets: [
          {
              data: [40, 30, 20, 10],
              backgroundColor: [COLORS.primary, COLORS.success, COLORS.warning, COLORS.info],
          }
      ]
  };

  // --- RADAR DATA ---
  const radarData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [
          {
              label: 'Set A',
              data: [80, 90, 60, 40, 70],
              borderColor: COLORS.success,
              backgroundColor: `${COLORS.success}40`, // transparent
              fill: true,
          },
          {
            label: 'Set B',
            data: [60, 50, 80, 90, 50],
            borderColor: COLORS.danger,
            backgroundColor: `${COLORS.danger}40`,
            fill: true,
        },
      ]
  };

  // --- BUBBLE DATA ---
  const bubbleData = {
      datasets: [
          {
              label: 'Set 1',
              data: Array.from({length: 15}).map(() => ({ x: Math.random() * 100, y: Math.random() * 100, r: Math.random() * 15 + 2 })),
              backgroundColor: COLORS.primary,
          },
          {
            label: 'Set 2',
            data: Array.from({length: 15}).map(() => ({ x: Math.random() * 100, y: Math.random() * 100, r: Math.random() * 15 + 2 })),
            backgroundColor: COLORS.danger,
        }
      ]
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-white">Chart.js Library</h2>
        <p className="text-grey-600 dark:text-grey-500 max-w-2xl">
          Comprehensive data visualization components built with Chart.js and React-Chartjs-2.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Column 1 */}
        <div className="space-y-8">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white">Line & Area Charts</h3>
            <ChartLine data={lineDataSingle} title="Simple Line" isDarkMode={isDarkMode} />
            <ChartLine data={lineDataMulti} title="Multi Series Line" isDarkMode={isDarkMode} />
            <ChartLine data={lineDataArea} title="Area Chart (Fill)" isDarkMode={isDarkMode} />
            <ChartLine data={lineDataDashed} title="Projections (Dashed)" isDarkMode={isDarkMode} />

            <h3 className="text-xl font-semibold text-grey-900 dark:text-white pt-8">Pie & Doughnut</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <ChartPie data={pieData} type="doughnut" title="Doughnut" isDarkMode={isDarkMode} />
                 <ChartPie data={pieData} type="pie" title="Pie" isDarkMode={isDarkMode} />
            </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-8">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white">Bar Charts</h3>
            <ChartBar data={barDataVertical} title="Vertical Bar" isDarkMode={isDarkMode} />
            <ChartBar data={barDataHorizontal} title="Horizontal Bar" horizontal isDarkMode={isDarkMode} />
            <ChartBar data={barDataStacked} title="Stacked Vertical" stacked isDarkMode={isDarkMode} />
            <ChartBar data={barDataStacked} title="Stacked Horizontal" horizontal stacked isDarkMode={isDarkMode} />
            
            {/* Gantt / Floating */}
            <ChartBar 
                data={barDataFloating} 
                title="Gantt Timeline (Floating Bars)" 
                horizontal 
                isDarkMode={isDarkMode}
                options={{
                    scales: {
                        x: { min: 0, max: 12, title: { display: true, text: 'Days' } }
                    }
                }} 
            />

            <h3 className="text-xl font-semibold text-grey-900 dark:text-white pt-8">Complex Charts</h3>
            <ChartRadar data={radarData} title="Radar / Spider" isDarkMode={isDarkMode} />
            <ChartBubble data={bubbleData} title="Bubble / Scatter" isDarkMode={isDarkMode} />
        </div>

      </div>
    </div>
  );
};

export default ChartUI;