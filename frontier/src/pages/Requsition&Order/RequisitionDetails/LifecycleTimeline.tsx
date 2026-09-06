import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
} from '@/components/ui/Timeline';
import { MARITIME_STEPS, TimelineStep } from '@/data/requisitionSidebarData';
import { RequisitionStatus } from '@/data/requisitionMockData';
import { Check } from 'lucide-react';

// ─── Status → active step index mapping ──────────────────────────────────────
// Returns the 1-based step that is currently ACTIVE for the given status.
// Steps before this index are "completed"; steps after are "future".

const STATUS_TO_ACTIVE_STEP: Record<RequisitionStatus, number> = {
  Draft: 1,
  Proceed: 2,
  'Pending approval': 3,
  'Awaiting Vendor': 3,
  'Proceed Further': 4,
  'Order Placed': 5,
  'Out For delivery': 6,
  Delivered: 7,
  'Rejected by PO': 4, // stalled at PO stage
};

// ─── Step state type ──────────────────────────────────────────────────────────

type StepState = 'completed' | 'active' | 'future';

function getStepState(stepId: number, activeStep: number): StepState {
  if (stepId < activeStep) return 'completed';
  if (stepId === activeStep) return 'active';
  return 'future';
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface LifecycleTimelineProps {
  status: RequisitionStatus;
}

// ─── Component ────────────────────────────────────────────────────────────────

const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({ status }) => {
  const activeStep = STATUS_TO_ACTIVE_STEP[status] ?? 1;

  return (
    <div className="px-2 py-3">
      <Timeline align="center">
        {MARITIME_STEPS.map((step, index) => {
          const state = getStepState(step.id, activeStep);
          const isLast = index === MARITIME_STEPS.length - 1;
          // Alternate: even indices (0, 2, 4…) → normal (left=time, right=content)
          // Odd indices (1, 3, 5…) → reversed (left=content, right=time)
          const isReversed = index % 2 !== 0;

          // ── Dot colour & variant ──
          const dotColor: 'success' | 'primary' | 'grey' =
            state === 'completed' ? 'success' : state === 'active' ? 'primary' : 'grey';
          const dotVariant: 'solid' | 'outline' =
            state === 'future' ? 'outline' : 'solid';

          return (
            <TimelineItem
              key={step.id}
              className={isReversed ? 'flex-row-reverse' : ''}
            >
              {/* Opposite side: time label */}
              <TimelineOppositeContent
                className={`py-4 ${isReversed ? 'text-left' : 'text-right'} text-xs`}
              >
                <span className="text-grey-400 dark:text-grey-500">
                  {state !== 'future' ? step.timestamp : ''}
                </span>
              </TimelineOppositeContent>

              {/* Center separator */}
              <TimelineSeparator>
                <TimelineDot variant={dotVariant} color={dotColor}>
                  {state === 'completed' ? <Check size={18} /> : step.icon}
                </TimelineDot>
                {!isLast && <TimelineConnector />}
              </TimelineSeparator>

              {/* Main content */}
              <TimelineContent
                className={`py-2 ${isReversed ? 'text-right' : 'text-left'} text-xs`}
              >{step.title}
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </div>
  );
};

export default LifecycleTimeline;
