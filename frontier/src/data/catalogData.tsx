import React from 'react';
import Badge from '../components/ui/Badge';
import { MoreHorizontal } from 'lucide-react';
import { Column } from '@/components/common/table/table';
import Avatar from '@/components/ui/Avatar';

export type ProductStatus = 'Active' | 'Inactive' | 'Draft' | 'Archive';

export interface CatalogProduct {
  id: number;
  productName: string;
  brand?: string;
  packingInfo: string;
  referenceCode: string;
  vendorName: string;
  status: ProductStatus;
  category: string;
  publishedOn: string;
  image: string;
  isExpiring?: boolean;
  country?: string;
  port?: string;
  productId?: string;
  productIdType?: string;
  ports?: string[];
  images?: string[];
  videos?: string[];
  variations?: string[];
  inventory?: Array<Record<string, unknown>>;
  catalogId?: string;
  offeringId?: string;
}

// --- Vendors ---
export const catalogVendors = [
  'All',
  'SMC Marine Supplies',
  'OceanGuard Equipment',
  'Neptune Logistics',
  'AquaShield Trading',
  'MarineTech Solutions',
  'Global Ship Parts',
  'Dubai Port Suppliers'
];

// Status badge color mapping
const getStatusColor = (status: ProductStatus) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Inactive': return 'dark';
    case 'Draft': return 'warning';
    case 'Archive': return 'danger';
    default: return 'light';
  }
};

// --- Table Columns ---
export const catalogColumns: Column<CatalogProduct>[] = [
  {
    header: 'Product Name',
    accessorKey: 'productName',
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar
          src={row.image}
          alt={row.productName}
          size='sm'
        />
        <div className="flex flex-col">
          <span className="text-primary font-medium">{row.productName}</span>
          <div className="flex items-center gap-2 text-xs text-grey-500 mt-1">
             <span className="font-mono">{row.referenceCode}</span>
             {row.brand && (
               <>
                 <span className="text-grey-300">•</span>
                 <span className="font-medium text-grey-600">{row.brand}</span>
               </>
             )}
          </div>
        </div>
      </div>
    ),
  },
  {
    header: 'Category',
    accessorKey: 'category',
    cell: (row) => (
      <Badge variant="soft" color="info" className="rounded-full px-3">
        {row.category || 'N/A'}
      </Badge>
    ),
  },
  {
    header: 'Packing Info',
    accessorKey: 'packingInfo',
    showInGrid: false,
  },
  {
    header: 'Vendor',
    accessorKey: 'vendorName',
    cell: (row) => <span className="font-medium text-grey-900 dark:text-white">{row.vendorName}</span>,
  },
  {
    header: 'Status',
    cell: (row) => (
      <Badge
        variant="soft"
        color={getStatusColor(row.status)}
        className="rounded-full px-3"
      >
        {row.status}
      </Badge>
    ),
  },
  {
    header: 'Published On',
    accessorKey: 'publishedOn',
    showInGrid: false,
  },
  {
    header: 'Action',
    className: 'text-right',
    cell: () => (
      <div className="flex items-center justify-end gap-2">
        <button className="text-grey-400 hover:text-grey-600 dark:text-grey-500 dark:hover:text-grey-300 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>
    ),
  },
];

// Helper to generate consistent images
const getImageUrl = (id: number, seed: string) => `https://picsum.photos/seed/${seed}${id}/200/200`;

// --- Mock Data: Marine-based products grouped by vendor ---
const baseCatalogTableData: CatalogProduct[] = [
  // SMC Marine Supplies
  {
    id: 1,
    productName: 'Marine Grade Hydraulic Oil',
    brand: 'Castrol Marine',
    packingInfo: '20L Drum',
    referenceCode: 'SMC-HYD-001',
    vendorName: 'SMC Marine Supplies',
    status: 'Active',
    category: 'Lubricants',
    publishedOn: '14 Feb, 24',
    image: getImageUrl(1, 'oil'),
  },
  {
    id: 2,
    productName: 'Anti-Corrosion Deck Paint',
    brand: 'Jotun',
    packingInfo: '5L Can',
    referenceCode: 'SMC-PNT-012',
    vendorName: 'SMC Marine Supplies',
    status: 'Active',
    category: 'Paints',
    publishedOn: '14 Feb, 24',
    image: getImageUrl(2, 'paint'),
    isExpiring: true,
  },
  {
    id: 3,
    productName: 'Marine Diesel Engine Filter',
    brand: 'Donaldson',
    packingInfo: 'Box of 6',
    referenceCode: 'SMC-FLT-045',
    vendorName: 'SMC Marine Supplies',
    status: 'Draft',
    category: 'Filters',
    publishedOn: '16 Feb, 24',
    image: getImageUrl(3, 'filter'),
  },
  {
    id: 4,
    productName: 'Ship Hull Cleaning Compound',
    brand: 'Unitor',
    packingInfo: '25Kg Bag',
    referenceCode: 'SMC-CLN-078',
    vendorName: 'SMC Marine Supplies',
    status: 'Active',
    category: 'Chemicals',
    publishedOn: '15 Feb, 24',
    image: getImageUrl(4, 'compound'),
  },
  // OceanGuard Equipment
  {
    id: 5,
    productName: 'SOLAS Approved Life Jacket',
    brand: 'Lalizas',
    packingInfo: 'Pack of 10',
    referenceCode: 'OGE-LFJ-102',
    vendorName: 'OceanGuard Equipment',
    status: 'Active',
    category: 'Safety',
    publishedOn: '16 Feb, 24',
    image: getImageUrl(5, 'jacket'),
  },
  {
    id: 6,
    productName: 'Fire Extinguisher 9Kg CO2',
    brand: 'Eversafe',
    packingInfo: 'Single Unit',
    referenceCode: 'OGE-FRE-203',
    vendorName: 'OceanGuard Equipment',
    status: 'Active',
    category: 'Safety',
    publishedOn: '17 Feb, 24',
    image: getImageUrl(6, 'extinguisher'),
  },
  {
    id: 7,
    productName: 'Emergency Immersion Suit',
    brand: 'Viking',
    packingInfo: 'Pack of 5',
    referenceCode: 'OGE-EIS-117',
    vendorName: 'OceanGuard Equipment',
    status: 'Inactive',
    category: 'Safety',
    publishedOn: '14 Feb, 24',
    image: getImageUrl(7, 'suit'),
  },
  {
    id: 8,
    productName: 'Radar Reflector SOLAS',
    brand: 'Plastimo',
    packingInfo: 'Single Unit',
    referenceCode: 'OGE-RAD-055',
    vendorName: 'OceanGuard Equipment',
    status: 'Active',
    category: 'Navigation',
    publishedOn: '18 Feb, 24',
    image: getImageUrl(8, 'radar'),
  },
  // Neptune Logistics
  {
    id: 9,
    productName: 'Mooring Rope 32mm Polypropylene',
    brand: 'Bridon',
    packingInfo: '220m Coil',
    referenceCode: 'NPL-MRP-330',
    vendorName: 'Neptune Logistics',
    status: 'Active',
    category: 'Deck Supplies',
    publishedOn: '15 Feb, 24',
    image: getImageUrl(9, 'rope'),
  },
  {
    id: 10,
    productName: 'Anchor Chain Shackle D-Type',
    brand: 'Crosby',
    packingInfo: 'Box of 20',
    referenceCode: 'NPL-ACS-441',
    vendorName: 'Neptune Logistics',
    status: 'Draft',
    category: 'Deck Supplies',
    publishedOn: '16 Feb, 24',
    image: getImageUrl(10, 'shackle'),
  },
  {
    id: 11,
    productName: 'Cargo Lashing Belt 50mm',
    brand: 'SpanSet',
    packingInfo: 'Pack of 25',
    referenceCode: 'NPL-CLB-552',
    vendorName: 'Neptune Logistics',
    status: 'Active',
    category: 'Deck Supplies',
    publishedOn: '18 Feb, 24',
    image: getImageUrl(11, 'belt'),
  },
  {
    id: 12,
    productName: 'Navigation Signal Flag Set',
    brand: 'Bainbridge',
    packingInfo: 'Complete Set',
    referenceCode: 'NPL-NSF-663',
    vendorName: 'Neptune Logistics',
    status: 'Archive',
    category: 'Navigation',
    publishedOn: '12 Feb, 24',
    image: getImageUrl(12, 'flag'),
  },
  // AquaShield Trading
  {
    id: 13,
    productName: 'Marine Ballast Water Treatment',
    brand: 'Alfa Laval',
    packingInfo: '50L Drum',
    referenceCode: 'AQS-BWT-701',
    vendorName: 'AquaShield Trading',
    status: 'Active',
    category: 'Chemicals',
    publishedOn: '17 Feb, 24',
    image: getImageUrl(13, 'water'),
  },
  {
    id: 14,
    productName: 'Fuel Oil Purifier Disc Stack',
    brand: 'Westfalia',
    packingInfo: 'Set of 12',
    referenceCode: 'AQS-FPD-802',
    vendorName: 'AquaShield Trading',
    status: 'Inactive',
    category: 'Engine Parts',
    publishedOn: '14 Feb, 24',
    image: getImageUrl(14, 'purifier'),
  },
  {
    id: 15,
    productName: 'Stern Tube Seal Assembly',
    brand: 'Wartsila',
    packingInfo: 'Single Unit',
    referenceCode: 'AQS-STS-903',
    vendorName: 'AquaShield Trading',
    status: 'Active',
    category: 'Engine Parts',
    publishedOn: '16 Feb, 24',
    image: getImageUrl(15, 'seal'),
  },
  {
    id: 16,
    productName: 'Anti-Fouling Bottom Paint',
    brand: 'International Paint',
    packingInfo: '20L Can',
    referenceCode: 'AQS-AFP-104',
    vendorName: 'AquaShield Trading',
    status: 'Draft',
    category: 'Paints',
    publishedOn: '18 Feb, 24',
    image: getImageUrl(16, 'bottompaint'),
  },
  // MarineTech Solutions
  {
    id: 17,
    productName: 'ECDIS Navigation System',
    brand: 'Furuno',
    packingInfo: 'Single Unit',
    referenceCode: 'MTS-ECD-501',
    vendorName: 'MarineTech Solutions',
    status: 'Active',
    category: 'Navigation',
    publishedOn: '15 Feb, 24',
    image: getImageUrl(17, 'ecdis'),
  },
  {
    id: 18,
    productName: 'Marine VHF Radio Transceiver',
    brand: 'Icom',
    packingInfo: 'Single Unit',
    referenceCode: 'MTS-VHF-602',
    vendorName: 'MarineTech Solutions',
    status: 'Active',
    category: 'Communication',
    publishedOn: '16 Feb, 24',
    image: getImageUrl(18, 'radio'),
  },
  {
    id: 19,
    productName: 'Vessel Tracking AIS Transponder',
    brand: 'Simrad',
    packingInfo: 'Kit',
    referenceCode: 'MTS-AIS-703',
    vendorName: 'MarineTech Solutions',
    status: 'Archive',
    category: 'Navigation',
    publishedOn: '10 Feb, 24',
    image: getImageUrl(19, 'ais'),
  },
  {
    id: 20,
    productName: 'Weather Fax Receiver System',
    brand: 'JRC',
    packingInfo: 'Single Unit',
    referenceCode: 'MTS-WFR-804',
    vendorName: 'MarineTech Solutions',
    status: 'Active',
    category: 'Communication',
    publishedOn: '17 Feb, 24',
    image: getImageUrl(20, 'weather'),
  },
  {
    id: 21,
    productName: 'Gyro Compass Maintenance Kit',
    brand: 'Sperry Marine',
    packingInfo: 'Toolbox',
    referenceCode: 'MTS-GCM-905',
    vendorName: 'MarineTech Solutions',
    status: 'Inactive',
    category: 'Navigation',
    publishedOn: '14 Feb, 24',
    image: getImageUrl(21, 'compass'),
  },
  {
    id: 22,
    productName: 'Marine Winch Electric 10T',
    brand: 'MacGregor',
    packingInfo: 'Single Unit',
    referenceCode: 'NPL-MWE-774',
    vendorName: 'Neptune Logistics',
    status: 'Active',
    category: 'Deck Supplies',
    publishedOn: '19 Feb, 24',
    image: getImageUrl(22, 'winch'),
  },
  {
    id: 23,
    productName: 'Propeller Shaft Bearing',
    brand: 'Thordon',
    packingInfo: 'Set of 4',
    referenceCode: 'AQS-PSB-115',
    vendorName: 'AquaShield Trading',
    status: 'Active',
    category: 'Engine Parts',
    publishedOn: '20 Feb, 24',
    image: getImageUrl(23, 'propeller'),
  },
  {
    id: 24,
    productName: 'Epoxy Resin Marine Grade',
    brand: 'West System',
    packingInfo: '10Kg Kit',
    referenceCode: 'SMC-EPX-089',
    vendorName: 'SMC Marine Supplies',
    status: 'Active',
    category: 'Chemicals',
    publishedOn: '19 Feb, 24',
    image: getImageUrl(24, 'resin'),
  },
];

export const countryPortMap = [
  { country: 'United States', port: 'Miami Port' },
  { country: 'United States', port: 'Houston Port' },
  { country: 'United States', port: 'Los Angeles Port' },
  { country: 'Singapore', port: 'Singapore Port (PSA)' },
  { country: 'Singapore', port: 'Jurong Port' },
  { country: 'Netherlands', port: 'Rotterdam Port' },
  { country: 'Netherlands', port: 'Amsterdam Port' },
  { country: 'United Arab Emirates', port: 'Jebel Ali (Dubai)' },
  { country: 'United Arab Emirates', port: 'Fujairah Port' },
  { country: 'India', port: 'Mumbai Port (JNPT)' },
  { country: 'India', port: 'Chennai Port' },
  { country: 'India', port: 'Kandla Port' }
];

export const catalogTableData: CatalogProduct[] = baseCatalogTableData.map((item, index) => ({
  ...item,
  country: countryPortMap[index % countryPortMap.length].country,
  port: countryPortMap[index % countryPortMap.length].port,
}));

