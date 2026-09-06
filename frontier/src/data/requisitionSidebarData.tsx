import React from 'react';
import {
  FileText,
  Mail,
  ClipboardCheck,
  ShoppingCart,
  Ship,
  Package,
  Stamp,
  Receipt,
  CreditCard,
  Star,
} from 'lucide-react';

// ─── Timeline Data ────────────────────────────────────────────────────────────

export interface TimelineStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  timestamp?: string;
}

export const MARITIME_STEPS: TimelineStep[] = [
  {
    id: 1,
    title: 'Requisition Created',
    description:
      'The Chief Engineer or Technical Sup. creates a requisition (via PMS) for spare parts, provisions, or stores.',
    icon: <FileText size={18} />,
    timestamp: '10 Jan 2024, 09:30 AM',
  },
  {
    id: 2,
    title: 'RFQ & Quotation Processing',
    description:
      'Purchasing team issues a formal Request for Quotation (RFQ) to ship chandlers/OEMs. Quotes are received with lead times and port delivery capabilities.',
    icon: <Mail size={18} />,
    timestamp: '11 Jan 2024, 10:45 AM',
  },
  {
    id: 3,
    title: 'Technical & Commercial Evaluation',
    description:
      'Superintendents verify quoted parts match machinery specs, class requirements (IACS), and budget.',
    icon: <ClipboardCheck size={18} />,
    timestamp: '12 Jan 2024, 02:15 PM',
  },
  {
    id: 4,
    title: 'Purchase Order (PO) Issued',
    description:
      'The approved PO is sent to the vendor, locking in prices, delivery dates, and the target port.',
    icon: <ShoppingCart size={18} />,
    timestamp: '13 Jan 2024, 11:00 AM',
  },
  {
    id: 5,
    title: 'Logistics & Port Coordination',
    description:
      'Vendor, buyer, and local ship agent coordinate freight and customs to ensure goods arrive when the vessel is berthed.',
    icon: <Ship size={18} />,
    timestamp: '15 Jan 2024, 08:30 AM',
  },
  {
    id: 6,
    title: 'Vessel Delivery & Receipt',
    description:
      'Goods are delivered to the deck. Crew checks physical delivery against the packing list.',
    icon: <Package size={18} />,
    timestamp: '20 Jan 2024, 04:00 PM',
  },
  {
    id: 7,
    title: 'GRN (Goods Received Note)',
    description:
      'Chief Engineer signs delivery note and logs GRN into the system, confirming items are onboard.',
    icon: <Stamp size={18} />,
    timestamp: '21 Jan 2024, 09:00 AM',
  },
  {
    id: 8,
    title: 'Invoice Matching & Verification',
    description:
      'Accounts team matches vendor invoice against the PO and GRN to verify quantities and prices.',
    icon: <Receipt size={18} />,
    timestamp: '23 Jan 2024, 10:15 AM',
  },
  {
    id: 9,
    title: 'Payment',
    description:
      'Accounts payable releases payment based on agreed maritime credit terms.',
    icon: <CreditCard size={18} />,
    timestamp: '25 Jan 2024, 11:30 AM',
  },
  {
    id: 10,
    title: 'Vendor Rating & Review',
    description:
      'Purchaser and crew rate the vendor on KPIs: delivery punctuality, part quality, and packing accuracy.',
    icon: <Star size={18} />,
    timestamp: '28 Jan 2024, 02:00 PM',
  },
];

// ─── Activity Log Data ────────────────────────────────────────────────────────

export type ActivityType = 'status_change' | 'comment' | 'system';

export interface ActivityEntry {
  id: number;
  type: ActivityType;
  person: {
    name: string;
    avatar: string;
    initials: string;
  };
  content: string;
  timestamp: string;
  badge?: {
    label: string;
    color: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'light';
  };
}

export const MOCK_ACTIVITY: ActivityEntry[] = [
  {
    id: 1,
    type: 'system',
    person: { name: 'System', avatar: '', initials: 'SYS' },
    content: 'Requisition created via PMS integration.',
    timestamp: '10 Jan 2024, 09:30 AM',
    badge: { label: 'Created', color: 'success' },
  },
  {
    id: 2,
    type: 'comment',
    person: {
      name: 'John Carter',
      avatar: 'https://i.pravatar.cc/150?u=21',
      initials: 'JC',
    },
    content:
      'Added Cylinder Liner to the list — please confirm the part number with the OEM before issuing RFQ.',
    timestamp: '10 Jan 2024, 10:15 AM',
  },
  {
    id: 3,
    type: 'status_change',
    person: {
      name: 'Emma Watson',
      avatar: 'https://i.pravatar.cc/150?u=22',
      initials: 'EW',
    },
    content: 'Status changed from Draft to Proceed.',
    timestamp: '12 Jan 2024, 02:00 PM',
    badge: { label: 'Status Change', color: 'info' },
  },
  {
    id: 4,
    type: 'comment',
    person: {
      name: 'Sarah Miller',
      avatar: 'https://i.pravatar.cc/150?u=24',
      initials: 'SM',
    },
    content:
      'RFQ sent to 3 vendors. Marine Supplies Ltd has confirmed they can supply all items. Awaiting quotes from the other two.',
    timestamp: '13 Jan 2024, 09:45 AM',
  },
  {
    id: 5,
    type: 'system',
    person: { name: 'System', avatar: '', initials: 'SYS' },
    content: 'Vendor enquiry deadline reminder: 3 enquiries pending response.',
    timestamp: '18 Jan 2024, 08:00 AM',
    badge: { label: 'Reminder', color: 'warning' },
  },
  {
    id: 6,
    type: 'comment',
    person: {
      name: 'David Chen',
      avatar: 'https://i.pravatar.cc/150?u=25',
      initials: 'DC',
    },
    content:
      'Marine Supplies Ltd quote received. Prices are within budget. Recommending approval for PO issuance.',
    timestamp: '19 Jan 2024, 11:30 AM',
  },
];
