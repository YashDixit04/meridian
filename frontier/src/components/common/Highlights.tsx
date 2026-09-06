import React from 'react';
import { MoreHorizontal, ArrowUp, ArrowDown } from 'lucide-react';
import {
  totalRevenue,
  breakdown,
  metrics,
  type MetricItem,
} from '@/data/highlightsData'; // adjust path to match your folder structure

import { Heading2, Heading5, BodySm, LabelXs } from '../ui/Typography';
import Button from '../ui/Button';

const Highlights: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-light-soft rounded-xl border border-grey-200 p-6 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Heading5 className="text-grey-900 dark:text-white">Highlights</Heading5>
        <Button variant="link" color="light" size="small" iconOnly>
          <MoreHorizontal size={20} className="text-grey-400" />
        </Button>
      </div>

      {/* Total Revenue */}
      <div className="mb-6">
        <BodySm className="text-grey-500 mb-1">Total Revenue from Plans</BodySm>
        <div className="flex items-center gap-3">
          <Heading2 className="text-grey-900 dark:text-white">
            {totalRevenue.amount}
          </Heading2>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${
              totalRevenue.change.isPositive
                ? 'bg-success-soft text-success'
                : 'bg-danger-soft text-danger'
            }`}
          >
            {totalRevenue.change.isPositive ? '+' : '-'}
            {totalRevenue.change.value}%
          </span>
        </div>
      </div>

      {/* Progress Bar + Legend */}
      <div className="mb-6">
        <div className="flex h-2.5 w-full rounded-full overflow-hidden mb-4">
          {breakdown.map((item, i) => (
            <div key={i} className={`${item.color}`} style={{ width: `${item.percentage}%` }} />
          ))}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {breakdown.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <LabelXs className="text-grey-600 dark:text-grey-800">
                {item.label}
              </LabelXs>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-grey-100 dark:border-grey-800 my-2" />

      {/* Metrics List */}
      <div className="flex flex-col gap-5 pt-4 flex-1 justify-center">
        {metrics.map((item: MetricItem, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-grey-400 dark:text-grey-500">
                <item.icon size={20} strokeWidth={1.5} />
              </div>
              <BodySm className="text-grey-900 font-medium">
                {item.label}
              </BodySm>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-grey-900 font-semibold text-sm">
                {item.value}
              </span>

              <div
                className={`flex items-center text-xs font-semibold w-14 justify-end ${
                  item.change.isPositive ? 'text-success' : 'text-danger'
                }`}
              >
                {item.change.isPositive ? (
                  <ArrowUp size={14} className="mr-0.5" strokeWidth={2.5} />
                ) : (
                  <ArrowDown size={14} className="mr-0.5" strokeWidth={2.5} />
                )}
                {item.change.value}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Highlights;