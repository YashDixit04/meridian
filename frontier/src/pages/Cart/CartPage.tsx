import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, PartyPopper } from 'lucide-react';
import GenericTablePage from '@/components/common/GenericTablePage';
import { CatalogProduct } from '@/data/catalogData';
import catalogService from '@/services/catalogService';
import { BreadcrumbLink } from '@/components/common/Breadcrub/dynamicbreadcrub';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Column } from '@/components/common/table/table';
import { useCart } from '@/context/CartContext';
import Loader from '@/components/common/Loader';
import Button from '@/components/ui/Button';

interface CartPageProps {
  onNavigate?: (tab: string) => void;
}

const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { cartItems, updateQuantity } = useCart();

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    catalogService.getProducts().then((productsData) => {
      if (mounted) {
        setProducts(productsData);
        setIsLoading(false);
      }
    });

    return () => { mounted = false; };
  }, []);

  const cartProducts = useMemo(() => {
    return products.filter((product) => cartItems[product.id] > 0);
  }, [products, cartItems]);

  const uniqueVendorsCount = useMemo(() => {
    const vendors = new Set(cartProducts.map((p) => p.vendorName));
    return vendors.size;
  }, [cartProducts]);

  const breadcrumbItems: BreadcrumbLink[] = [
    { label: 'Home', href: '#' },
    { label: 'Catalogue', href: '#' },
    { label: 'Cart', href: '#', active: true },
  ];

  // Randomly assign a 'top vendor' based on ID to simulate the best rate feature
  const topVendorProductIds = useMemo(() => {
    // Just a mock way to assign top vendor. Let's assign it to the first item for each unique productName
    const bestRates = new Set<number>();
    const seenProducts = new Set<string>();

    // Sort so we have deterministic "best rate" (e.g. lowest ID)
    const sorted = [...cartProducts].sort((a, b) => a.id - b.id);
    for (const p of sorted) {
      if (!seenProducts.has(p.productName)) {
        bestRates.add(p.id);
        seenProducts.add(p.productName);
      }
    }
    return bestRates;
  }, [cartProducts]);

  const columns = useMemo(() => {
    return [
      {
        header: 'Product Name',
        accessorKey: 'productName',
        cell: (row) => (
          <div className="flex items-center gap-3">
            <Avatar src={row.image} alt={row.productName} size="sm" />
            <span className="text-primary font-medium">{row.productName}</span>
          </div>
        ),
      },
      {
        header: 'Category',
        accessorKey: 'category',
        cell: (row) => (
          <Badge variant="soft" color="info" className="rounded-full px-3">
            {row.category}
          </Badge>
        ),
      },
      {
        header: 'Packing Info',
        accessorKey: 'packingInfo',
        showInGrid: false,
      },
      {
        header: 'Reference Code',
        accessorKey: 'referenceCode',
        showInGrid: false,
        cell: (row) => <span className="text-primary font-mono text-xs">{row.referenceCode}</span>,
      },
      {
        header: 'Vendor Name',
        accessorKey: 'vendorName',
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-grey-900 dark:text-white">{row.vendorName}</span>
            {topVendorProductIds.has(row.id) && (
              <Badge variant="soft" color="success" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                Best Rate
              </Badge>
            )}
          </div>
        ),
      },
      {
        header: 'Status',
        cell: (row) => (
          row.isExpiring ? (
            <Badge variant="soft" color="warning" className="rounded-full px-3">
              Expiring Soon
            </Badge>
          ) : (
            <Badge variant="soft" color="success" className="rounded-full px-3">
              Active
            </Badge>
          )
        ),
      },
      {
        header: 'Quantity',
        className: 'text-right',
        cell: (row) => {
          const qty = cartItems[row.id] || 0;
          return (
            <div className="flex items-center justify-end">
              <div className="inline-flex items-center border border-grey-200 dark:border-grey-700 bg-white dark:bg-grey-100 rounded-md overflow-hidden">
                <button
                  onClick={(e) => { e.stopPropagation(); updateQuantity(row.id, qty - 1); }}
                  className="px-2.5 py-1.5 hover:bg-grey-50 dark:hover:bg-grey-800 text-grey-600 dark:text-grey-300 transition-colors"
                >
                  -
                </button>
                <span className="px-3 font-semibold text-sm text-grey-900 dark:text-white min-w-[32px] text-center">
                  {qty}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); updateQuantity(row.id, qty + 1); }}
                  className="px-2.5 py-1.5 hover:bg-grey-50 dark:hover:bg-grey-800 text-grey-600 dark:text-grey-300 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          );
        }
      }
    ] as Column<CatalogProduct>[];
  }, [cartItems, updateQuantity, topVendorProductIds]);

  if (isLoading) {
    return <Loader text="Loading Cart..." />;
  }

  return (
    <GenericTablePage
      breadcrumbItems={breadcrumbItems}
      data={cartProducts}
      columns={columns}
      itemsPerPage={8}
      customContent={
        <div className="mb-2">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-grey-900 dark:text-white tracking-tight">
              Shopping Cart
            </h1>
          </div>

          {cartProducts.length > 0 && (
            <div className="flex items-center gap-2 mt-1  bg-primary/5">
              <PartyPopper className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium text-primary">
                Hurray! Total {uniqueVendorsCount} vendor{uniqueVendorsCount !== 1 ? 's' : ''} {uniqueVendorsCount !== 1 ? 'are' : 'is'} available to compare the price of these products.
              </p>
            </div>
          )}
        </div>
      }
    />
  );
};

export default CartPage;
