import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, Bell, X } from 'lucide-react';

export type SnackbarVariant = 'success' | 'warning' | 'alert' | 'info' | 'default';

interface SnackbarProps {
  variant?: SnackbarVariant;
  content: string;
  isOpen: boolean;
  onClose: () => void;
  autoCloseDuration?: number;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    containerClass: 'bg-success-soft border border-success/30 text-success-accent dark:bg-success-soft dark:text-success-accent',
    iconClass: 'text-success'
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-warning-soft border border-warning/30 text-warning-accent dark:bg-warning-soft dark:text-success-accent',
    iconClass: 'text-warning'
  },
  alert: {
    icon: XCircle,
    containerClass: 'bg-danger-soft border border-danger/30 text-danger-accent dark:bg-danger-soft dark:text-danger-accent',
    iconClass: 'text-danger'
  },
  info: {
    icon: Info,
    containerClass: 'bg-info-soft border border-info/30 text-info-accent dark:bg-info-soft dark:text-info-accent',
    iconClass: 'text-info'
  },
  default: {
    icon: Bell,
    containerClass: 'bg-grey-100 border border-grey-300 text-grey-800 dark:bg-grey-800 dark:border-grey-600 dark:text-grey-200',
    iconClass: 'text-grey-600 dark:text-grey-400'
  }
};

const Snackbar: React.FC<SnackbarProps> = ({
  variant = 'default',
  content,
  isOpen,
  onClose,
  autoCloseDuration = 5000
}) => {
  useEffect(() => {
    if (isOpen && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDuration, onClose]);

  if (!isOpen) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 left-1/2 z-[9999] animate-bounce-in-up">
      <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[300px] max-w-[90vw] ${config.containerClass}`}>
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconClass}`} />
          <span className="text-sm font-medium">{content}</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
