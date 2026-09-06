import React from 'react';
import { Plus, Download, Upload } from 'lucide-react';

import Button from '@/components/ui/Button';

interface AddProductActionsProps {
  isContextLoading: boolean;
  contextMessage: string;
  isImporting: boolean;
  isExporting: boolean;
  onBulkUploadClick: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
}

export default function AddProductActions({
  isContextLoading,
  contextMessage,
  isImporting,
  isExporting,
  onBulkUploadClick,
  onImportClick,
  onExportClick,
}: AddProductActionsProps) {
  return (
    <div className="w-full sm:w-auto flex items-center justify-end gap-3">
      <Button
        variant="outline"
        color="primary"
        size="small"
        leftIcon={<Plus className="w-4 h-4" />}
        onClick={onBulkUploadClick}
        disabled={isContextLoading || !!contextMessage || isImporting}
      >
        Bulk Upload
      </Button>
      <Button
        variant="outline"
        color="primary"
        size="small"
        leftIcon={<Download className="w-4 h-4" />}
        onClick={onImportClick}
        disabled={isContextLoading || !!contextMessage || isImporting}
      >
        Import
      </Button>
      <Button
        variant="solid"
        color="primary"
        size="small"
        leftIcon={<Upload className="w-4 h-4" />}
        onClick={onExportClick}
        disabled={isContextLoading || isExporting}
      >
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>
    </div>
  );
}
