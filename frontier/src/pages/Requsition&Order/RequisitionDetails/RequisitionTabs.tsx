import React, { useState } from 'react';
import { Package, Send, MessageSquare } from 'lucide-react';
import ItemsTab from './ItemsTab';
import VendorEnquiriesTab from './VendorEnquiriesTab';
import VendorResponsesTab from './VendorResponsesTab';
import { RequisitionItem, VendorEnquiry, VendorResponse, TabKey } from '@/data/requisitionMockData';

// ─── Tab definition ───────────────────────────────────────────────────────────

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RequisitionTabsProps {
  items: RequisitionItem[];
  enquiries: VendorEnquiry[];
  responses: VendorResponse[];
  initialTab?: TabKey;
}

// ─── Component ────────────────────────────────────────────────────────────────

const RequisitionTabs: React.FC<RequisitionTabsProps> = ({
  items,
  enquiries,
  responses,
  initialTab = 'items',
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const tabs: TabDef[] = [
    {
      key: 'items',
      label: 'Items',
      icon: <Package size={14} />
    },
    {
      key: 'vendor-enquiries',
      label: 'Vendor Enquiries',
      icon: <Send size={14} />,
    },
    {
      key: 'vendor-responses',
      label: 'Vendor Responses',
      icon: <MessageSquare size={14} />
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Tab bar ── */}
      <div className="flex items-end gap-0 px-6 bg-white dark:bg-grey-100">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                relative flex items-center gap-2 px-2 py-2 text-sm font-medium
                transition-colors duration-150 border-b-2 -mb-px
                ${isActive
                  ? 'border-primary text-primary dark:text-primary'
                  : 'border-transparent text-grey-500 dark:text-grey-400 hover:text-grey-700 dark:hover:text-grey-200 hover:border-grey-300'
                }
              `}
            >
              <span className={isActive ? 'text-primary' : 'text-grey-400 dark:text-grey-500'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'items' && <ItemsTab items={items} />}
        {activeTab === 'vendor-enquiries' && <VendorEnquiriesTab enquiries={enquiries} />}
        {activeTab === 'vendor-responses' && <VendorResponsesTab responses={responses} />}
      </div>
    </div>
  );
};

export default RequisitionTabs;
