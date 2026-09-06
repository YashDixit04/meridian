import React from 'react';

export const TourNavigation = ({ steps, currentStep, setCurrentStep, setIsOpen }: any) => {
  return (
    <div className="flex items-center justify-between w-full mt-6">
      <div className="flex gap-2 items-center">
        {steps.map((_: any, idx: number) => (
          <div
            key={idx}
            className={`rounded-full transition-colors ${
              currentStep === idx ? 'bg-white w-2 h-2' : 'bg-[#363843] w-1.5 h-1.5'
            }`}
          />
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors border ${
            currentStep === 0
              ? 'opacity-0 cursor-default pointer-events-none'
              : 'text-white border-[#363843] hover:bg-[#26272F]'
          }`}
        >
          Back
        </button>
        <button
          onClick={() => {
            if (currentStep === steps.length - 1) {
              setIsOpen(false);
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
          className="px-4 py-1.5 text-sm font-medium text-[#111B37] bg-white rounded-lg hover:bg-grey-50 transition-colors"
        >
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};
