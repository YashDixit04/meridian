import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';

import GenericTablePage from '@/components/common/GenericTablePage';
import type { Column } from '@/components/common/table/table';
import { BreadcrumbLink } from '@/components/common/Breadcrub/dynamicbreadcrub';
import Loader from '@/components/common/Loader';
import Button from '@/components/ui/Button';
import { ApiException } from '@/lib/apiClient';
import superadminCatalogueService, {
  SuperadminCatalogueProduct,
} from '@/services/superadminCatalogueService';

const formatDateTime = (value: string | undefined): string => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatPackingInfo = (inventory: Array<Record<string, unknown>> | undefined): string => {
  if (!Array.isArray(inventory) || inventory.length === 0) {
    return 'N/A';
  }

  const firstRow = inventory.find(
    (entry) => entry && typeof entry === 'object' && !Array.isArray(entry),
  );

  if (!firstRow) {
    return 'N/A';
  }

  const parts: string[] = [];

  const variant = typeof firstRow.variant === 'string' ? firstRow.variant.trim() : '';
  if (variant) {
    parts.push(`Variant: ${variant}`);
  }

  if (typeof firstRow.quantity === 'number' && Number.isFinite(firstRow.quantity)) {
    parts.push(`Qty: ${firstRow.quantity}`);
  }

  const sku = typeof firstRow.sku === 'string' ? firstRow.sku.trim() : '';
  if (sku) {
    parts.push(`SKU: ${sku}`);
  }

  if (parts.length === 0) {
    return `Packed (${inventory.length} rows)`;
  }

  return parts.join(' | ');
};

const getReferenceCodeStatus = (product: SuperadminCatalogueProduct): string => {
  const hasProductId = typeof product.productId === 'string' && product.productId.trim().length > 0;
  const hasProductIdType =
    typeof product.productIdType === 'string' && product.productIdType.trim().length > 0;

  if (hasProductId && hasProductIdType) {
    return 'Ready';
  }

  if (hasProductId) {
    return 'Missing Type';
  }

  return 'Missing';
};

const getReferenceCodeStatusClassName = (status: string): string => {
  if (status === 'Ready') {
    return 'text-success bg-success-soft border-success/30';
  }

  if (status === 'Missing Type') {
    return 'text-warning bg-warning-soft border-warning/30';
  }

  return 'text-danger bg-danger-soft border-danger/30';
};

const getAddedByValue = (product: SuperadminCatalogueProduct): string => {
  if (product.sourceTenantName && product.sourceTenantName.trim().length > 0) {
    return product.sourceTenantName;
  }

  if (product.sourceTenantId && product.sourceTenantId.trim().length > 0) {
    return product.sourceTenantId;
  }

  return 'System';
};

const breadcrumbItems: BreadcrumbLink[] = [
  { label: 'Home', href: '#' },
  { label: 'Catalogue', href: '#', active: true },
];

export default function SuperadminCataloguePage() {
  const [products, setProducts] = useState<SuperadminCatalogueProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const loadProducts = useCallback(async (isManualRefresh = false) => {
    setErrorMessage('');

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await superadminCatalogueService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error instanceof ApiException) {
        setErrorMessage(error.errorMessage || 'Failed to load superadmin catalogue products.');
      } else {
        setErrorMessage('Failed to load superadmin catalogue products.');
      }
    } finally {
      if (isManualRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadProducts(false);
  }, [loadProducts]);

  const handleDeleteProduct = async (product: SuperadminCatalogueProduct) => {
    const confirmed = window.confirm(
      'Delete this product from superadmin catalogue and cascade to all tenant mappings and tenant catalogues?',
    );

    if (!confirmed) {
      return;
    }

    setDeletingProductId(product.id);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await superadminCatalogueService.deleteProduct(product.id);
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setSuccessMessage(
        `Deleted product and cascaded cleanup. Offerings: ${result.deletedOfferingsCount}, `
        + `Mappings: ${result.deletedMappingsCount}, Tenant catalogue entries: ${result.deletedTenantCatalogueEntriesCount}, `
        + `Affected tenants: ${result.affectedTenantIds.length}.`,
      );
    } catch (error) {
      if (error instanceof ApiException) {
        setErrorMessage(error.errorMessage || 'Failed to delete superadmin catalogue product.');
      } else {
        setErrorMessage('Failed to delete superadmin catalogue product.');
      }
    } finally {
      setDeletingProductId(null);
    }
  };

  const columns = useMemo<Column<SuperadminCatalogueProduct>[]>(
    () => [
      {
        header: 'Product Name',
        accessorKey: 'name',
        cell: (row) => (
          <div className="flex flex-col">
            <span className="font-medium text-grey-900 dark:text-white">{row.name}</span>
            <span className="text-xs text-grey-500">
              Source Tenant: {row.sourceTenantName || row.sourceTenantId || 'N/A'}
            </span>
          </div>
        ),
      },
      {
        header: 'Product Id',
        cell: (row) => row.productId || 'N/A',
      },
      {
        header: 'Category',
        cell: (row) => row.sourceCatalogName || row.sourceCatalogId || 'N/A',
      },
      {
        header: 'Packing Info',
        cell: (row) => formatPackingInfo(row.inventory),
      },
      {
        header: 'Reference Code Status',
        cell: (row) => {
          const status = getReferenceCodeStatus(row);

          return (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getReferenceCodeStatusClassName(status)}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        header: 'Added By / Uploaded By',
        cell: (row) => getAddedByValue(row),
      },
      {
        header: 'Publish At',
        cell: (row) => formatDateTime(row.createdAt),
      },
      {
        header: 'Action',
        className: 'text-right',
        cell: (row) => {
          const isDeleting = deletingProductId === row.id;

          return (
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                color="danger"
                size="small"
                leftIcon={<Trash2 size={14} />}
                onClick={(event) => {
                  event.stopPropagation();
                  void handleDeleteProduct(row);
                }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          );
        },
      },
    ],
    [deletingProductId],
  );

  const actions = (
    <div className="w-full sm:w-auto flex items-center justify-end gap-3">
      <Button
        variant="outline"
        color="primary"
        size="small"
        leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
        onClick={() => {
          void loadProducts(true);
        }}
        disabled={isRefreshing || isLoading}
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
    </div>
  );

  if (isLoading) {
    return <Loader text="Loading Superadmin Catalogue..." />;
  }

  const customContent = (
    <div className="space-y-2">
      {errorMessage && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-2 text-sm text-danger">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg border border-success/30 bg-success-soft px-4 py-2 text-sm text-success">
          {successMessage}
        </div>
      )}
    </div>
  );

  return (
    <GenericTablePage
      breadcrumbItems={breadcrumbItems}
      data={products}
      columns={columns}
      itemsPerPage={10}
      actions={actions}
      customContent={customContent}
    />
  );
}
