import React from 'react';
import { VendorResponse } from '@/data/requisitionMockData';
import { MessageSquare } from 'lucide-react';
import { Heading3 } from '@/components/ui/Typography';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface VendorResponsesTabProps {
  responses: VendorResponse[];
}

const VendorResponsesTab: React.FC<VendorResponsesTabProps> = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-[#0A0A0D] rounded-xl min-h-[400px]">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <MessageSquare size={48} className="text-grey-300 dark:text-grey-600 opacity-80" />
        <Heading3 className="text-grey-900 dark:text-white">Coming Soon</Heading3>
        <p className="text-grey-500 dark:text-grey-400">
          Vendor Responses feature is currently under development.
        </p>
      </div>
    </div>
  );
};

export default VendorResponsesTab;
