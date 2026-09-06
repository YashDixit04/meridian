import React, { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Send } from 'lucide-react';
import { ActivityEntry, MOCK_ACTIVITY } from '@/data/requisitionSidebarData';

// ─── Single activity item ─────────────────────────────────────────────────────

const ActivityItem: React.FC<{ entry: ActivityEntry }> = ({ entry }) => {
  const isSystem = entry.type === 'system';

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isSystem ? (
          <div className="w-7 h-7 rounded-full bg-grey-100 dark:bg-grey-800 border border-grey-200 dark:border-grey-700 flex items-center justify-center">
            <span className="text-[9px] font-bold text-grey-400 dark:text-grey-500">
              SYS
            </span>
          </div>
        ) : (
          <Avatar src={entry.person.avatar} size="sm" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
          <span
            className={`text-[12px] font-semibold ${isSystem
              ? 'text-grey-400 dark:text-grey-500'
              : 'text-grey-800 dark:text-white'
              }`}
          >
            {entry.person.name}
          </span>
          {entry.badge && (
            <Badge
              variant="soft"
              color={entry.badge.color}
              className="rounded-full px-2 py-0 text-[10px] leading-5"
            >
              {entry.badge.label}
            </Badge>
          )}
        </div>
        <p
          className={`text-[12px] leading-relaxed ${isSystem
            ? 'text-grey-400 dark:text-grey-500 italic'
            : 'text-grey-600 dark:text-grey-400'
            }`}
        >
          {entry.content}
        </p>
        <p className="text-[10px] text-grey-400 dark:text-grey-600 mt-1">
          {entry.timestamp}
        </p>
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const ActivityLog: React.FC = () => {
  const [comment, setComment] = useState('');

  const handlePost = () => {
    if (comment.trim()) {
      // UI-only: just clear the field for now
      setComment('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {MOCK_ACTIVITY.map((entry, index) => (
          <React.Fragment key={entry.id}>
            <ActivityItem entry={entry} />
            {index < MOCK_ACTIVITY.length - 1 && (
              <div className="border-l-2 border-grey-100 dark:border-grey-800 ml-3.5 h-3" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Add comment box */}
      <div className="flex-shrink-0 border-t border-grey-200 dark:border-grey-800 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            className="
              flex-1 resize-none text-[12px] px-3 py-2 rounded-lg
              border border-grey-200 dark:border-grey-700
              bg-white dark:bg-grey-900
              text-grey-900 dark:text-white
              placeholder:text-grey-400 dark:placeholder:text-grey-600
              focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50
              transition-colors
            "
          />
          <button
            onClick={handlePost}
            disabled={!comment.trim()}
            className="
              h-9 w-9 flex-shrink-0 rounded-lg flex items-center justify-center
              bg-primary text-white
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-primary/90 transition-colors
            "
            title="Post comment"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
