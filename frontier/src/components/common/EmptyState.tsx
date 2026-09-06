import React from 'react';

interface EmptyStateProps {
    title?: string;
    description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
    title = "No Data Found", 
    description = "We couldn't find any data to display here." 
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center w-full min-h-[300px]">
            <img 
                src="/nousers.svg" 
                alt="No data found" 
                className="w-48 h-48 mb-6 opacity-80"
            />
            <h3 className="text-xl font-semibold text-grey-800 dark:text-grey-200 mb-2">
                {title}
            </h3>
            <p className="text-grey-500 max-w-sm">
                {description}
            </p>
        </div>
    );
};

export default EmptyState;
