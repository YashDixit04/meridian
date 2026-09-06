import React, { useState, useEffect } from 'react';
import { X, Flag } from 'lucide-react';
import Button, { ButtonColor, ButtonVariant } from './Button';
import Input from './Input';
import Combobox from './Combobox';
import DatePicker from './DatePicker';
import { Heading6, BodySm, InputLabel, LabelSm } from './Typography';

// --- Types & Schemas ---

export type ModalFieldType = 'input' | 'select' | 'dropdown' | 'daterange' | 'custom';

export interface ModalField {
  id: string;
  type: ModalFieldType;
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  optionGroups?: Record<string, { value: string; label: string }[]>;
  dependsOn?: string;
  required?: boolean;
  CustomComponent?: React.ReactNode; // For advanced layouts like Budget Calculation
}

export interface ModalTab {
  id: string;
  label: string;
  fields: ModalField[];
  customFooterSection?: React.ReactNode;
}

export interface ModalAction {
  id: string;
  label: string;
  onClick: (formData: Record<string, any>) => void;
  variant?: ButtonVariant;
  color?: ButtonColor;
  closeAfter?: boolean; // automatically close modal after clicking
}

export type ModalVariant = 'delete' | 'warning' | 'form' | 'stepper';

export interface ModalConfig {
  isOpen: boolean;
  onClose: () => void;
  variant: ModalVariant;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;

  // Basic Form
  fields?: ModalField[];

  // Tabbed / Stepper Form
  tabs?: ModalTab[];

  actions: ModalAction[];
}

// --- Component ---

const GenericModal: React.FC<{ config: ModalConfig }> = ({ config }) => {
  const {
    isOpen,
    onClose,
    variant,
    title,
    subtitle,
    icon,
    fields,
    tabs,
    actions
  } = config;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFieldChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleActionClick = (action: ModalAction) => {
    action.onClick(formData);
    if (action.closeAfter !== false) {
      onClose();
    }
  };

  const isTabsActive = variant === 'stepper' && tabs && tabs.length > 0;

  const validateCurrentTab = () => {
    if (!isTabsActive || !tabs) return true;
    const currentFields = tabs[activeTabIdx].fields;
    const newErrors: Record<string, string> = {};
    let isValid = true;

    currentFields.forEach(f => {
      if (f.required) {
        if (f.type !== 'daterange' && f.type !== 'custom') {
          const val = formData[f.id];
          if (!val || String(val).trim() === '') {
            newErrors[f.id] = `${f.label} is required`;
            isValid = false;
          }
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleStepperNext = () => {
    if (validateCurrentTab()) {
      if (activeTabIdx < tabs!.length - 1) {
        setActiveTabIdx(prev => prev + 1);
        setErrors({});
      } else {
        const continueAction = actions.find(a => a.id === 'continue' || a.color === 'primary') || actions[actions.length - 1];
        if (continueAction) {
          handleActionClick(continueAction);
        }
      }
    }
  };

  const handleStepperBack = () => {
    if (activeTabIdx > 0) {
      setActiveTabIdx(prev => prev - 1);
      setErrors({});
    } else {
      const backAction = actions.find(a => a.id === 'back' || a.color === 'grey') || actions[0];
      if (backAction) {
        handleActionClick(backAction);
      } else {
        onClose();
      }
    }
  };

  // --- Render Helpers ---

  const renderField = (field: ModalField) => {
    switch (field.type) {
      case 'input':
        return (
          <div key={field.id} className="mb-4">
            <InputLabel className="block text-grey-700 dark:text-grey-300 mb-1.5">
              {field.label}{field.required && <span className="text-danger ml-0.5">*</span>}
            </InputLabel>
            <Input
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => {
                handleFieldChange(field.id, e.target.value);
                if (errors[field.id]) setErrors(prev => ({ ...prev, [field.id]: '' }));
              }}
            />
            {errors[field.id] && <span className="text-danger text-xs mt-1 block font-medium">{errors[field.id]}</span>}
          </div>
        );
      case 'select':
      case 'dropdown': {
        let fieldOptions = field.options || [];
        if (field.dependsOn && field.optionGroups) {
          const dependentValue = formData[field.dependsOn];
          if (dependentValue && field.optionGroups[dependentValue]) {
            fieldOptions = field.optionGroups[dependentValue];
          } else {
            fieldOptions = [];
          }
        }

        return (
          <div key={field.id} className="mb-4">
            <InputLabel className="block text-grey-700 dark:text-grey-300 mb-1.5">
              {field.label}{field.required && <span className="text-danger ml-0.5">*</span>}
            </InputLabel>
            <Combobox
              options={fieldOptions}
              placeholder={field.placeholder || "Select option..."}
              value={formData[field.id] || ''}
              onChange={(val) => {
                handleFieldChange(field.id, val);
                if (errors[field.id]) setErrors(prev => ({ ...prev, [field.id]: '' }));
              }}
            />
            {errors[field.id] && <span className="text-danger text-xs mt-1 block font-medium">{errors[field.id]}</span>}
          </div>
        );
      }
      case 'daterange':
        return (
          <div key={field.id} className="mb-4 flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <InputLabel className="block text-grey-700 dark:text-grey-300 mb-1.5">
                {field.label}
              </InputLabel>
              <div className="flex items-center gap-3 w-full">
                <DatePicker
                  placeholder="Start Date"
                  value={formData[`${field.id}_start`]}
                  onChange={(d) => handleFieldChange(`${field.id}_start`, d)}
                />
                <span className="text-grey-500">—</span>
                <DatePicker
                  placeholder="End Date"
                  value={formData[`${field.id}_end`]}
                  onChange={(d) => handleFieldChange(`${field.id}_end`, d)}
                />
              </div>
            </div>
            {/* Custom Extra Slots like 'Fresh' or 'Dry' button indicators if specified inside CustomComponent */}
            {field.CustomComponent && (
              <div className="ml-2 w-24">
                {field.CustomComponent}
              </div>
            )}
          </div>
        );
      case 'custom':
        return (
          <div key={field.id} className="mb-4">
            {field.CustomComponent}
          </div>
        )
      default:
        return null;
    }
  };

  // Compute Layout Width
  const isSmallModal = variant === 'delete' || variant === 'warning';
  const modalWrapperClass = isSmallModal
    ? 'w-full max-w-md p-6'
    : 'w-full max-w-2xl p-6';

  const currentFields = isTabsActive && tabs ? tabs[activeTabIdx].fields : (fields || []);
  const currentCustomFooter = isTabsActive && tabs ? tabs[activeTabIdx].customFooterSection : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Background Overlay with 10px blur requirement */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className={`relative bg-white dark:bg-grey-100 border border-grey-100 dark:border-grey-400 rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[90vh] ${modalWrapperClass}`}>

        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-2">
            {icon && (
              <div className="h-12 w-12 rounded-xl border border-grey-200 dark:border-grey-400 flex items-center justify-center text-grey-800 dark:text-grey-900 mb-2">
                {icon}
              </div>
            )}
            <div>
              <Heading6 >
                {title}
              </Heading6>
              {subtitle && (
                <BodySm className="text-grey-500 mt-1 dark:text-grey-600">
                  {subtitle}
                </BodySm>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            color="grey"
            size="small"
            iconOnly
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>

        {/* Dynamic Stepper / Tabs */}
        {isTabsActive && tabs && (
          <div className="flex mb-6 gap-6 relative">
            {tabs.map((tab, idx) => {
              const isActive = activeTabIdx === idx;
              const isPassed = idx < activeTabIdx;
              return (
                <div key={tab.id} className="relative pb-2" onClick={() => {
                  if (isPassed) {
                    setActiveTabIdx(idx);
                    setErrors({});
                  }
                }}>
                  <LabelSm className={`transition-colors ${isActive ? 'text-success' : 'text-grey-500'} ${isPassed ? 'cursor-pointer hover:text-success' : ''}`}>
                    {tab.label}
                  </LabelSm>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-success rounded-t-sm" />
                  )}
                  {!isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-grey-200 dark:bg-grey-800 rounded-t-sm" />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar-thin pr-1 pb-4 z-10">
          <div className="flex flex-col h-full">
            {/* Dynamic Fields */}
            {currentFields.map(renderField)}

            {/* Custom Embedded Footer Content (e.g. Budget Summary Box) */}
            {currentCustomFooter && (
              <div className="mt-4">
                {currentCustomFooter}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`mt-4 flex items-center gap-3 pt-4 border-t border-grey-100 dark:border-grey-800 ${isSmallModal ? 'justify-end' : 'justify-between'}`}>
          {!isSmallModal && <div className="flex-1" />}
          <div className="flex items-center gap-3 ml-auto w-full sm:w-auto">
            {isTabsActive ? (
              <>
                <Button variant="outline" color="grey" onClick={handleStepperBack}>
                  Back
                </Button>
                <Button variant="solid" color="primary" onClick={handleStepperNext}>
                  {activeTabIdx === tabs!.length - 1 ? 'Create Requisition' : 'Continue'}
                </Button>
              </>
            ) : (
              actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || 'solid'}
                  color={action.color || 'primary'}
                  onClick={() => handleActionClick(action)}
                  className="flex-1 sm:flex-none"
                >
                  {action.label}
                </Button>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GenericModal;
