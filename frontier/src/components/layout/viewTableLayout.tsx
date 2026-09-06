import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

export type ViewMode = 'list' | 'grid';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewChange }) => {
  return (
    <div className="flex items-center bg-grey-50 dark:bg-grey-200 rounded-lg p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-1.5 rounded transition-colors ${
          viewMode === 'grid'
            ? 'bg-white dark:bg-grey-400 shadow-sm text-grey-900 dark:text-white'
            : 'hover:bg-white dark:hover:bg-grey-700 text-grey-400 hover:text-grey-900 dark:hover:text-white'
        }`}
        aria-label="Grid view"
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-1.5 rounded transition-colors ${
          viewMode === 'list'
            ? 'bg-white dark:bg-grey-400 shadow-sm text-grey-900 dark:text-white'
            : 'hover:bg-white dark:hover:bg-grey-700 text-grey-400 hover:text-grey-900 dark:hover:text-white'
        }`}
        aria-label="List view"
      >
        <List size={18} />
      </button>
    </div>
  );
};

export default ViewToggle;
