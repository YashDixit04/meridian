import React from 'react';

type TimelineAlign = 'left' | 'right' | 'center';

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
  align?: TimelineAlign;
}

const TimelineContext = React.createContext<{ align: TimelineAlign }>({ align: 'left' });

export const Timeline: React.FC<TimelineProps> = ({ children, className = '', align = 'left' }) => {
  return (
    <TimelineContext.Provider value={{ align }}>
      <div className={`flex flex-col w-full ${className}`}>
        {children}
      </div>
    </TimelineContext.Provider>
  );
};

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ children, className = '', ...props }) => {
  const { align } = React.useContext(TimelineContext);

  // For center alignment, we use a grid or flex row that spans full width
  const alignClass = align === 'center'
    ? 'flex-row min-h-[80px]'
    : align === 'right'
      ? 'flex-row-reverse'
      : 'flex-row'; // left

  return (
    <div className={`flex group relative ${alignClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const TimelineSeparator: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col items-center flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
};

interface TimelineConnectorProps {
  className?: string;
}

export const TimelineConnector: React.FC<TimelineConnectorProps> = ({ className = '' }) => {
  return (
    <div className={`w-[2px] flex-grow bg-grey-200 dark:bg-grey-800 my-1 ${className}`} />
  );
};

interface TimelineContentProps {
  children: React.ReactNode;
  className?: string;
}

export const TimelineContent: React.FC<TimelineContentProps> = ({ children, className = '' }) => {
  const { align } = React.useContext(TimelineContext);

  // Padding logic based on alignment
  let paddingClass = 'pl-4 pb-8';
  if (align === 'right') paddingClass = 'pr-4 pb-8 text-right';
  if (align === 'center') paddingClass = 'px-6 pb-8 flex-1'; // Item content in center mode usually needs to be flexible

  return (
    <div className={`${paddingClass} ${className}`}>
      {children}
    </div>
  );
};

interface TimelineOppositeContentProps {
  children: React.ReactNode;
  className?: string;
}

export const TimelineOppositeContent: React.FC<TimelineOppositeContentProps> = ({ children, className = '' }) => {
  const { align } = React.useContext(TimelineContext);

  // If not center aligned, opposite content might imply a specific look or be hidden/inline
  // In MUI, OppositeContent is usually only used in 'alternate' or 'right' modes effectively.
  // For 'left' alignment, we might render it, but usually it's used for the 'Time' in center mode.

  if (align !== 'center') return null;

  return (
    <div className={`flex-1 px-6 pb-8 text-right text-sm text-grey-500 dark:text-grey-500 ${className}`}>
      {children}
    </div>
  );
};

interface TimelineDotProps {
  variant?: 'simple' | 'outline' | 'solid';
  color?: 'primary' | 'success' | 'danger' | 'info' | 'warning' | 'grey';
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
  className?: string;
}

export const TimelineDot: React.FC<TimelineDotProps> = ({
  variant = 'simple',
  color = 'primary',
  size = 'medium',
  children,
  className = ''
}) => {

  const colorMap = {
    primary: {
      solid: 'bg-primary text-white border-transparent',
      outline: 'border-primary text-primary bg-white dark:bg-[#0A0A0D]',
      simple: 'bg-primary border-transparent',
    },
    success: {
      solid: 'bg-success text-white border-transparent',
      outline: 'border-success text-success bg-white dark:bg-[#0A0A0D]',
      simple: 'bg-success border-transparent',
    },
    danger: {
      solid: 'bg-danger text-white border-transparent',
      outline: 'border-danger text-danger bg-white dark:bg-[#0A0A0D]',
      simple: 'bg-danger border-transparent',
    },
    info: {
      solid: 'bg-info text-white border-transparent',
      outline: 'border-info text-info bg-white dark:bg-[#0A0A0D]',
      simple: 'bg-info border-transparent',
    },
    warning: {
      solid: 'bg-warning text-white border-transparent',
      outline: 'border-warning text-warning bg-white dark:bg-[#0A0A0D]',
      simple: 'bg-warning border-transparent',
    },
    grey: {
      solid: 'bg-grey-500 text-white border-transparent',
      outline: 'border-grey-500 text-grey-500 bg-white dark:bg-[#0A0A0D]',
      simple: 'bg-grey-500 border-transparent',
    },
  };

  const sizeClasses = {
    small: children ? 'w-6 h-6 text-[10px]' : 'w-2.5 h-2.5',
    medium: children ? 'w-10 h-10' : 'w-3.5 h-3.5',
    large: 'w-12 h-12',
  };

  // Border logic
  const borderClass = variant === 'outline' ? 'border-[2px]' : 'border-0';

  // If it's simple (just a dot), ensure it's rounded full and centered
  return (
    <div
      className={`
        rounded-full flex items-center justify-center z-10 
        ${sizeClasses[size]} 
        ${colorMap[color][variant]} 
        ${borderClass} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};
