import React, { useEffect, useMemo, useState } from 'react';
import GenericTablePage from '@/components/common/GenericTablePage';
import Button from '@/components/ui/Button';
import ViewToggle from '@/components/layout/viewTableLayout';
import { Column } from '@/components/common/table/table';
import { authService } from '@/services/authService';
import tenantService from '@/services/tenantService';

interface DocumentsPageProps {
    tenantId?: string;
}

interface VendorDocumentRow {
    id: string;
    vendorName: string;
    documentType: string;
    documentRef: string;
    kycStatus: string;
    uploadedAt: string;
}

const formatDocumentType = (value: string): string =>
    value
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, (char) => char.toUpperCase());

const DocumentsPage: React.FC<DocumentsPageProps> = ({ tenantId: propTenantId }) => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [documents, setDocuments] = useState<VendorDocumentRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const session = authService.getSession();
    const tenantId = propTenantId || session?.tenantId || '';

    useEffect(() => {
        const fetchDocuments = async () => {
            if (!tenantId) {
                setDocuments([]);
                setIsLoading(false);
                setPageError('Tenant context is missing. Open this page from Tenant Details.');
                return;
            }

            try {
                setIsLoading(true);
                const rows = await tenantService.getVendorKycDocuments(tenantId);
                const mapped = rows.map((item) => ({
                    id: item.id,
                    vendorName: item.vendorName,
                    documentType: formatDocumentType(item.documentType),
                    documentRef: item.documentValue,
                    kycStatus: item.kycStatus,
                    uploadedAt: new Date(item.uploadedAt).toLocaleString(),
                }));

                setDocuments(mapped);
                setPageError('');
            } catch (err) {
                console.error('Failed to load tenant vendor documents:', err);
                setDocuments([]);
                setPageError('Failed to load tenant vendor documents. Please refresh and try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocuments();
    }, [tenantId]);

    const columns: Column<VendorDocumentRow>[] = useMemo(() => [
        {
            header: 'Vendor',
            accessorKey: 'vendorName',
        },
        {
            header: 'Document Type',
            accessorKey: 'documentType',
        },
        {
            header: 'Reference',
            accessorKey: 'documentRef',
            cell: (row) => {
                if (row.documentRef.startsWith('http://') || row.documentRef.startsWith('https://')) {
                    return (
                        <a
                            href={row.documentRef}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline"
                        >
                            Open Document
                        </a>
                    );
                }

                return <span className="font-mono text-xs">{row.documentRef}</span>;
            },
        },
        {
            header: 'KYC Status',
            accessorKey: 'kycStatus',
        },
        {
            header: 'Uploaded At',
            accessorKey: 'uploadedAt',
        },
    ], []);

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Tenant', href: '#' },
        { label: 'Documents', href: '#', active: true },
    ];

    const actions = (
        <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            <Button variant="solid" color="primary" size="small">
                Export
            </Button>
        </div>
    );

    return (
        <GenericTablePage
            breadcrumbItems={breadcrumbItems}
            data={documents}
            columns={columns}
            itemsPerPage={7}
            actions={actions}
            viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
            viewMode={viewMode}
            customContent={
                <>
                    {isLoading && (
                        <div className="rounded-lg border border-primary/20 bg-primary-soft px-4 py-2 text-sm text-primary">
                            Loading vendor KYC documents...
                        </div>
                    )}
                    {pageError && (
                        <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-2 text-sm text-danger">
                            {pageError}
                        </div>
                    )}
                </>
            }
        />
    );
};

export default DocumentsPage;
