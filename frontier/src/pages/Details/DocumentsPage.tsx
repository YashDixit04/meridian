import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Heading3 } from '@/components/ui/Typography';

const DocumentsPage: React.FC = () => {
    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Users', href: '#' },
        { label: 'User Details', href: '#' },
        { label: 'Documents', href: '#', active: true },
    ];

    return (
        <PageLayout breadcrumbItems={breadcrumbItems}>
            <div className="flex-1 flex flex-col items-center justify-center h-full p-8">
                <div className="flex flex-col items-center gap-6 max-w-md text-center">
                    <div className="w-24 h-24 rounded-full bg-grey-100 dark:bg-grey-800 flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-grey-400">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                    </div>
                    <Heading3 className="text-grey-900 dark:text-white">Documents Coming Soon</Heading3>
                    <p className="text-grey-500 dark:text-grey-400">
                        This section is under development. Document data will be available shortly.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
};

export default DocumentsPage;
