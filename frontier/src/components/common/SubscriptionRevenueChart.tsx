
import React, { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { ChevronDown } from 'lucide-react';
import { COLORS, commonOptions } from '../ui/charts/ChartUtils';
import { Heading5, BodySm, LabelXs } from '../ui/Typography';
import Tooltip from '../ui/Tooltip';
import Button from '../ui/Button';

interface SubscriptionRevenueChartProps {
  isDarkMode?: boolean;
}

const SubscriptionRevenueChart: React.FC<SubscriptionRevenueChartProps> = ({ isDarkMode = false }) => {
  const labels = ['Jan 25', 'Jan 26', 'Jan 27', 'Jan 28', 'Jan 29', 'Jan 30', 'Jan 31', 'Feb 1', 'Feb 2', 'Feb 3', 'Feb 4', 'Feb 5', 'Feb 6', 'Feb 7', 'Feb 8'];

  // Data approximations from the image
  const data = {
    labels,
    datasets: [
      {
        label: 'This year',
        data: [130, 80, 115, 90, 160, 115, 135, 135, 95, 110, 80, 125, 125, 125, 70],
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
        pointBackgroundColor: COLORS.primary,
        pointBorderColor: isDarkMode ? '#151518' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0, // Straight lines
      },
      {
        label: 'Last year',
        data: [70, 90, 105, 80, 60, 60, 60, 60, 60, 60, 75, 85, 80, 78, 90],
        borderColor: isDarkMode ? '#363843' : '#DBDFE9', // Grey-300
        backgroundColor: isDarkMode ? '#363843' : '#DBDFE9',
        pointBackgroundColor: isDarkMode ? '#363843' : '#DBDFE9',
        pointBorderColor: isDarkMode ? '#151518' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0, // Straight lines
      },
    ],
  };

  const defaultOpts = commonOptions(isDarkMode);

  const options: ChartOptions<'line'> = {
    ...defaultOpts,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Custom legend in header
      },
      tooltip: {
        enabled: false, // Disable default canvas tooltip
        external: (context: any) => {
            // Tooltip Element
            let tooltipEl = document.getElementById('chartjs-custom-tooltip');
    
            // Create element on first render
            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-custom-tooltip';
                tooltipEl.style.pointerEvents = 'none';
                tooltipEl.style.position = 'absolute';
                tooltipEl.style.transition = 'all .1s ease';
                tooltipEl.style.zIndex = '9999';
                document.body.appendChild(tooltipEl);
            }
    
            const tooltipModel = context.tooltip;
    
            // Hide if no tooltip
            if (tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = '0';
                return;
            }
    
            // Set Text
            if (tooltipModel.body) {
                const titleLines = tooltipModel.title || [];
                const bodyLines = tooltipModel.body.map((b: any) => b.lines);
    
                // Matches components/ui/Tooltip.tsx styling
                let innerHtml = `
                    <div class="bg-grey-900 text-grey-100 text-xs font-medium px-3 py-2 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                `;
    
                titleLines.forEach((title: string) => {
                    innerHtml += `<div class="font-bold mb-1.5 border-b border-grey-700 pb-1 text-white">${title}</div>`;
                });
    
                bodyLines.forEach((body: string, i: number) => {
                    const colors = tooltipModel.labelColors[i];
                    const span = `<span class="inline-block w-2 h-2 mr-2 rounded-[2px]" style="background:${colors.backgroundColor}"></span>`;
                    innerHtml += `<div class="flex items-center mb-0.5 last:mb-0">${span}${body}</div>`;
                });
                innerHtml += '</div>';
    
                tooltipEl.innerHTML = innerHtml;
            }
    
            const position = context.chart.canvas.getBoundingClientRect();
            
            // Display, position, and set styles
            tooltipEl.style.opacity = '1';
            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
            tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
            
            // Add offset to prevent overlapping cursor
            tooltipEl.style.transform = 'translate(-50%, 10px)'; 
        }
      },
    },
    scales: {
      x: {
        ...defaultOpts.scales?.x,
        grid: {
          color: isDarkMode ? '#26272F' : '#F0F1F6', // Lighter grid for vertical lines
          drawOnChartArea: true, // Show vertical grid lines
        },
        border: {
           display: false
        },
        ticks: {
           ...defaultOpts.scales?.x?.ticks,
           maxRotation: 0,
           autoSkip: true,
           maxTicksLimit: 8, // Reduce clutter
        }
      },
      y: {
        ...defaultOpts.scales?.y,
        display: false, // Hide Y axis as per image (no labels on left)
        grid: {
          display: false, // No horizontal grid lines
        },
      },
    },
    interaction: {
        mode: 'index',
        intersect: false,
    },
  };

  // Clean up tooltip element on unmount to avoid ghost elements if component is removed
  useEffect(() => {
    return () => {
        const tooltipEl = document.getElementById('chartjs-custom-tooltip');
        if (tooltipEl) {
            tooltipEl.remove();
        }
    };
  }, []);

  return (
    <div className="w-full bg-white dark:bg-light-soft rounded-xl border border-grey-200 p-6 shadow-sm">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        
        {/* Title & Subtitle */}
        <div>
          <Heading5 className="text-grey-900 dark:text-white mb-1">
            Subscription Revenue Trend
          </Heading5>
          <BodySm className="text-grey-500">
            Tenant plan earnings year-over-year
          </BodySm>
        </div>

        {/* Legend & Controls */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            
            {/* Custom Legend */}
            <div className="flex items-center gap-4 text-grey-600 dark:text-grey-400">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-grey-300 dark:bg-grey-700 rounded-[2px]"></span>
                    <BodySm>Last year</BodySm>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-primary rounded-[2px]"></span>
                    <BodySm>This year</BodySm>
                </div>
            </div>

            {/* Badge with Tooltip */}
            <Tooltip content="Increased by 6.19% vs last year" position="top">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-success-soft text-success dark:bg-success/20 cursor-help">
                    <LabelXs className="font-bold">+6.19%</LabelXs>
                </span>
            </Tooltip>

            {/* Dropdown Trigger */}
            <Button
                variant="outline"
                color="light"
                size="small"
                rightIcon={<ChevronDown size={14} className="text-grey-500" />}
                className="bg-grey-50 dark:bg-grey-800 border-transparent text-grey-700 dark:text-grey-300 font-medium"
            >
                Last 30 days
            </Button>

        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[225px] w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default SubscriptionRevenueChart;
