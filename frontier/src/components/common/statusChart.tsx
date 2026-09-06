import React from 'react';
import { ChartData } from 'chart.js';
import { MoreVertical } from 'lucide-react';
import ChartPie from '../ui/charts/ChartPie';
import { Heading5 } from '../ui/Typography';
import { THEME_COLORS } from '../../style/constants';
import Button from '../ui/Button';

interface RequisitionStatusChartProps {
  isDarkMode: boolean;
}

const RequisitionStatusChart: React.FC<RequisitionStatusChartProps> = ({ isDarkMode }) => {
  
  const getColor = (key: string, variantName: string) => {
    const group = THEME_COLORS.find(c => c.key === key);
    const variant = group?.variants.find(v => v.name === variantName);
    return isDarkMode ? variant?.dark : variant?.light;
  };

  const data: ChartData<'doughnut'> = {
    labels: ['Requisition', 'Urgent', 'Approved', 'In Review', 'Waiting for approval'],
    datasets: [
      {
        data: [25, 15, 20, 15, 25], // Example data to match visual proportions roughly
        backgroundColor: [
          getColor('primary', 'Primary') || '#1379F0', // Requisition - Blue
          getColor('danger', 'Danger') || '#ED143B',   // Urgent - Red (closest to Orange in brand)
          getColor('success', 'Success') || '#0BC33F', // Approved - Green
          getColor('info', 'Info') || '#4921EA',       // In Review - Purple
          getColor('warning', 'Warning') || '#FEC524', // Waiting for approval - Yellow
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  return (
    <ChartPie
      data={data}
      type="doughnut"
      height={350}
      title={<Heading5 className="text-grey-900 dark:text-white">Requisition Status</Heading5>}
      isDarkMode={isDarkMode}
      cutout="60%"
      action={
        <Button variant="link" color="light" size="small">
          <MoreVertical size={20} />
        </Button>
      }
      actionTooltip="Options"
      actionTooltipPosition="right"
    />
  );
};

export default RequisitionStatusChart;
