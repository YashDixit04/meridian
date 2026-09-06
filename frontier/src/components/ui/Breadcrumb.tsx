import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ children, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap gap-2 text-sm text-grey-500 dark:text-grey-400">
        {children}
      </ol>
    </nav>
  );
};

export interface BreadcrumbItemProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ 
  children, 
  className = '', 
  active = false,
  href,
  onClick
}) => {
  const BaseTag = href || onClick ? 'a' : 'span';

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (!onClick) {
      return;
    }

    event.preventDefault();
    onClick();
  };
  
  return (
    <li className={`inline-flex items-center ${className}`}>
      <BaseTag 
        href={href} 
        onClick={onClick ? handleClick : undefined}
        className={`
            transition-colors flex items-center gap-2
            ${active 
                ? 'font-medium text-grey-900 dark:text-white cursor-default' 
                : 'hover:text-grey-900 dark:hover:text-white cursor-pointer'
            }
        `}
        aria-current={active ? 'page' : undefined}
      >
        {children}
      </BaseTag>
    </li>
  );
};

export interface BreadcrumbSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

export const BreadcrumbSeparator: React.FC<BreadcrumbSeparatorProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <li 
        role="presentation" 
        aria-hidden="true" 
        className={`select-none text-grey-300 dark:text-grey-600 flex items-center ${className}`}
    >
        {children ?? <ChevronRight size={16} />}
    </li>
  );
};