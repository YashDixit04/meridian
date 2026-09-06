import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from '@/components/ui/Breadcrumb';
import React from 'react';

export interface BreadcrumbLink {
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

interface DynamicBreadcrumbProps {
  items: BreadcrumbLink[];
}

const DynamicBreadcrumb: React.FC<DynamicBreadcrumbProps> = ({ items }) => {
  return (
    <Breadcrumb>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <BreadcrumbItem 
            active={item.active} 
            href={item.href}
            onClick={item.onClick}
            className={`text-sm ${item.active ? 'text-grey-900 dark:text-white font-medium' : 'text-grey-500 hover:text-primary transition-colors'}`}
          >
            {item.label}
          </BreadcrumbItem>
          {index < items.length - 1 && (
            <BreadcrumbSeparator className="text-grey-300 text-xs">/</BreadcrumbSeparator>
          )}
        </React.Fragment>
      ))}
    </Breadcrumb>
  );
};

export default DynamicBreadcrumb;
