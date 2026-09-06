import React, { useState } from 'react';
import { Clock, MessageSquare } from 'lucide-react';
import { RequisitionStatus } from '@/data/requisitionMockData';
import LifecycleTimeline from './LifecycleTimeline';
import ActivityLog from '@/components/common/ActivityLog';

// ─── Tab definitions ──────────────────────────────────────────────────────────

type SidebarTab = 'timeline' | 'activity';

interface SidebarTabDef {
  key: SidebarTab;
  label: string;
  icon: React.ReactNode;
}

const SIDEBAR_TABS: SidebarTabDef[] = [
  { key: 'timeline', label: 'Lifecycle', icon: <Clock size={13} /> },
  { key: 'activity', label: 'Activity', icon: <MessageSquare size={13} /> },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface RequisitionSidebarProps {
  status: RequisitionStatus;
}

// ─── Component ────────────────────────────────────────────────────────────────

const RequisitionSidebar: React.FC<RequisitionSidebarProps> = ({ status }) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('timeline');

  return (
    <div
      className="
        flex flex-col h-full
        rounded-xl border border-grey-200 dark:border-grey-200
        bg-white dark:bg-grey-100
        shadow-sm overflow-hidden
      "
    >
      {/* ── Tab bar ── */}
      <div className="flex items-end gap-0 px-4 pt-3 bg-white dark:bg-grey-100 flex-shrink-0 ">
        {SIDEBAR_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                relative flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium
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
        {activeTab === 'timeline' && <LifecycleTimeline status={status} />}
        {activeTab === 'activity' && <ActivityLog />}
      </div>
    </div>
  );
};

export default RequisitionSidebar;
