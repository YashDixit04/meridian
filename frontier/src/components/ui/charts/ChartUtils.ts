import { 
    Chart, 
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Filler,
    Tooltip,
    Legend,
    Title,
    LineController,
    BarController,
    PieController,
    DoughnutController,
    RadarController,
    BubbleController
} from 'chart.js';

// Register specific components used in the app
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title,
  LineController,
  BarController,
  PieController,
  DoughnutController,
  RadarController,
  BubbleController
);

// Brand colors mapping matching the CSS variables
export const COLORS = {
  primary: '#1379F0',
  success: '#0BC33F',
  danger: '#ED143B',
  info: '#4921EA',
  warning: '#FEC524',
  grey200: '#E2E4ED',
  grey300: '#DBDFE9',
  grey600: '#78829D',
  grey800: '#27314B',
  darkGrey200: '#26272F', // dark mode mapping for grey-200
  darkGrey800: '#B5B7C8', // dark mode mapping for grey-800
};

export const getThemeColors = (isDarkMode: boolean) => {
  if (isDarkMode) {
    return {
      grid: '#26272F', // grey-200 in dark mode
      text: '#9A9CAE', // grey-700 in dark mode
      tooltipBg: '#1B1C22',
      tooltipText: '#FFFFFF',
    };
  }
  return {
    grid: '#E2E4ED', // grey-200
    text: '#78829D', // grey-600
    tooltipBg: '#111B37',
    tooltipText: '#FFFFFF',
  };
};

// Return any to avoid strict union type mismatches when merging into specific chart options
export const commonOptions = (isDarkMode: boolean): any => {
  const theme = getThemeColors(isDarkMode);
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme.text,
          font: {
            family: 'Inter, sans-serif',
            size: 11,
          },
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          padding: 20,
        },
        position: 'top',
        align: 'end',
      },
      tooltip: {
        backgroundColor: theme.tooltipBg,
        titleColor: theme.tooltipText,
        bodyColor: theme.tooltipText,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        titleFont: { family: 'Inter', size: 13, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
      },
    },
    scales: {
      x: {
        grid: {
          color: theme.grid,
          tickLength: 8,
          tickColor: 'transparent',
        },
        border: {
           display: false
        },
        ticks: {
          color: theme.text,
          font: { family: 'Inter', size: 10 },
        },
      },
      y: {
        grid: {
          color: theme.grid,
          tickLength: 0,
        },
        border: {
           display: false,
           dash: [4, 4]
        },
        ticks: {
          color: theme.text,
          font: { family: 'Inter', size: 10 },
          padding: 10,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4, // Smooth curves by default
        borderWidth: 2,
      },
      point: {
        radius: 0, // Hide points by default
        hoverRadius: 6,
        hitRadius: 20,
      },
      bar: {
        borderRadius: 4, // Rounded bars
      },
    },
  };
};

// Helper for gradient fills
export const createGradient = (ctx: CanvasRenderingContext2D, color: string) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, `${color}80`); // 50% opacity
  gradient.addColorStop(1, `${color}00`); // 0% opacity
  return gradient;
};