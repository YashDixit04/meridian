
import React, {useState} from 'react';
import { Shield, Hexagon, Ghost, AlertCircle, ChevronUp, ChevronDown, Crown, Layers, User, Clock, DollarSign, Repeat, TrendingDown } from 'lucide-react';
import { DASHBOARD_STATS } from '../../data/dashboard_stats';


// Helper to map icon string to Lucide component
const getIcon = (iconName: string, className?: string) => {
  switch (iconName) {
    case 'Shield': return <Shield className={className} />;
    case 'Hexagon': return <Hexagon className={className} />;
    case 'Ghost': return <Ghost className={className} />;
    case 'AlertCircle': return <AlertCircle className={className} />;
    case 'Crown': return <Crown className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'User': return <User className={className} />;
    case 'Clock': return <Clock className={className} />;
    case 'DollarSign': return <DollarSign className={className} />;
    case 'Repeat': return <Repeat className={className} />;
    case 'TrendingDown': return <TrendingDown className={className} />;
    default: return null;
  }
};

const DashboardHead: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDanger = DASHBOARD_STATS.some(stat => stat.color === 'danger');
  // Common Card Content
  const StatCardContent = ({ stat }: { stat: any }) => (
    <>
      {/* Icon Header */}
      <div className="mb-4">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${stat.color === 'primary' ? 'text-primary bg-primary-soft dark:bg-primary/10' : ''}
          ${stat.color === 'warning' ? 'text-warning bg-warning-soft dark:bg-warning/10' : ''}
          ${stat.color === 'dark' ? 'text-grey-700 bg-grey-100 dark:text-white dark:bg-grey-800' : ''}
          ${stat.color === 'danger' ? 'text-danger bg-danger-soft dark:bg-danger/10' : ''}
          ${stat.color === 'info' ? 'text-info bg-info-soft dark:bg-info/10' : ''}
          ${stat.color === 'success' ? 'text-success bg-success-soft dark:bg-success/10' : ''}
          ${stat.color === 'muted' ? 'text-grey-700 bg-grey-100 dark:text-white dark:bg-grey-800' : ''}
        `}>
          {getIcon(stat.icon, "w-5 h-5 stroke-[2px] text-current")}
        </div>
      </div>

      {/* Stats Info */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl font-bold text-grey-900 dark:text-white">{stat.value}</span>
          {stat.trend && (
             <span className="flex items-center text-xs font-semibold text-success bg-success-soft dark:bg-success/10 px-1.5 py-0.5 rounded">
               {stat.trend}
               <ChevronUp size={12} className="ml-0.5" strokeWidth={3} />
             </span>
          )}
        </div>
        <p className="text-xs font-medium text-grey-500 dark:text-grey-400">{stat.label}</p>
      </div>
    </>
  );

  return (
    <div className="w-full bg-[#F7FAFC] dark:bg-light-soft rounded-2xl relative z-0 transition-all duration-300 group overflow-hidden">
      
      {/* Container Gradient for Danger State */}
      {hasDanger && !isExpanded && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            background: 'linear-gradient(to top, var(--danger-soft) 0%, transparent 50%, transparent 100%)' 
          }}
        />
      )}

      <div className={`p-6 sm:p-8 pb-12 flex flex-col xl:flex-row gap-8 items-start ${isExpanded ? 'xl:items-start' : 'xl:items-center'} overflow-hidden transition-all duration-300 relative z-0`}>
        {/* Left Text Section */}
        <div className="flex-shrink-0 min-w-[280px]">
          <h1 className="text-3xl font-bold text-grey-900 dark:text-white mb-2">Good Evening, Admin</h1>
          <p className="text-sm text-grey-600 dark:text-grey-400">Snapshot of Your Business Activity</p>
        </div>

        {/* Vertical Divider (Hidden on mobile/tablet, visible on large screens) */}
        <div className="hidden xl:block w-px h-24 bg-grey-200 mx-4 z-0 flex-shrink-0"></div>

        {/* Stats Container */}
        <div className="flex-1 w-full overflow-hidden relative min-h-[140px]">
          {isExpanded ? (
            // Expanded Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {DASHBOARD_STATS.map((stat, index) => (
                <div 
                  key={`${stat.id}-${index}`} 
                  className="bg-white dark:bg-[#0A0A0D] border border-grey-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-[140px]"
                >
                  <StatCardContent stat={stat} />
                </div>
              ))}
            </div>
          ) : (
            // Collapsed Marquee View
            <div className="flex w-full gap-4 [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]">
                {/* Track 1 */}
                <div className="flex shrink-0 items-center gap-4 animate-marquee hover:[animation-play-state:paused]">
                   {DASHBOARD_STATS.map((stat, idx) => (
                      <div 
                        key={`track1-${stat.id}-${idx}`} 
                        className="bg-white dark:bg-[#0A0A0D] border border-grey-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-[140px] w-[240px] flex-shrink-0 relative overflow-hidden"
                      >
                         <StatCardContent stat={stat} />
                      </div>
                   ))}
                </div>
                {/* Track 2 (Duplicate for Loop) */}
                <div className="flex shrink-0 items-center gap-4 animate-marquee hover:[animation-play-state:paused]" aria-hidden="true">
                   {DASHBOARD_STATS.map((stat, idx) => (
                      <div 
                        key={`track2-${stat.id}-${idx}`} 
                        className="bg-white dark:bg-[#0A0A0D] border border-grey-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-[140px] w-[240px] flex-shrink-0 relative overflow-hidden"
                      >
                         {stat.color === 'danger' && (
                           <div 
                             className="absolute inset-0 pointer-events-none" 
                             style={{ background: 'linear-gradient(to top, rgba(237, 20, 59, 0.1), transparent)' }} 
                           />
                         )}
                         <StatCardContent stat={stat} />
                      </div>
                   ))}
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Drag/Expand Handle Button */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-b-2xl transition-colors z-0"
        role="button"
        aria-label={isExpanded ? "Collapse" : "Expand"}
      >
        <div className="relative w-12 h-6 flex items-center justify-center">
            <div className="w-12 h-1 bg-grey-300 dark:bg-grey-600 rounded-full transition-all group-hover:w-16"></div>
            <ChevronDown 
                size={14} 
                className={`
                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    text-grey-500 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-y-1
                    ${isExpanded ? 'rotate-180' : ''}
                `} 
            />
        </div>
      </div>

    </div>
  );
};

export default DashboardHead;
