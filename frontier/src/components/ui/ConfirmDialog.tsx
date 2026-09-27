import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, Trash2, X } from 'lucide-react';
import Button from './Button';
import { Heading6, BodySm } from './Typography';

export type DialogKind = 'confirm' | 'alert';
export type DialogTone = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  kind: DialogKind;
  tone: DialogTone;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const toneIcon = (kind: DialogKind, tone: DialogTone) => {
  if (kind === 'confirm' && tone === 'danger') {
    return <Trash2 size={16} className="text-danger" />;
  }
  if (tone === 'success') {
    return <CheckCircle2 size={16} className="text-success" />;
  }
  if (tone === 'info') {
    return <Info size={16} className="text-info" />;
  }
  return <AlertTriangle size={16} className="text-warning" />;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  kind,
  tone,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4"
      data-testid="app-dialog"
    >
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[6px]"
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        className="relative w-full max-w-[420px] rounded-[28px] bg-white dark:bg-[#1B1C22] border border-grey-200 dark:border-white/5 shadow-2xl px-6 pt-5 pb-5"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="h-10 w-10 rounded-full bg-grey-50 dark:bg-white/5 border border-grey-200 dark:border-white/10 flex items-center justify-center">
            {toneIcon(kind, tone)}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onCancel}
            className="h-8 w-8 rounded-full flex items-center justify-center text-grey-400 hover:text-grey-700 dark:hover:text-white hover:bg-grey-50 dark:hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div id="app-dialog-title" className="pr-2">
          <Heading6 className="!text-[20px] !leading-7 tracking-normal text-grey-900 dark:text-white">
            {title}
          </Heading6>
        </div>
        <BodySm className="mt-2 !leading-6 tracking-normal text-grey-500 dark:text-grey-400">
          {message}
        </BodySm>

        <div className="mt-6 pt-4 border-t border-grey-200 dark:border-white/10 flex items-center justify-end gap-2.5">
          {kind === 'confirm' && (
            <Button
              variant="outline"
              color="grey"
              size="small"
              data-testid="app-dialog-cancel"
              onClick={onCancel}
              className="!rounded-full !px-4 min-w-[88px]"
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            variant="solid"
            color={tone === 'danger' ? 'danger' : 'primary'}
            size="small"
            data-testid={kind === 'alert' ? 'app-dialog-ok' : 'app-dialog-confirm'}
            onClick={onConfirm}
            className="!rounded-full !px-4 min-w-[88px]"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
