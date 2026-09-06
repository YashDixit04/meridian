import { StepType } from '@reactour/tour';
import React from 'react';

const StepContent = ({ title, text }: { title: string; text: string }) => (
  <div>
    <h3 className="text-[16px] font-semibold text-white mb-2">{title}</h3>
    <p className="text-[14px] text-gray-200 leading-snug">
      {text}
    </p>
  </div>
);

export const tourSteps: StepType[] = [
  {
    selector: '.tour-step-search',
    content: (
      <StepContent 
        title="Global Search" 
        text="This is the global search option. You can search for products, requisitions, and other information across the platform from here." 
      />
    ) as any,
  },
  {
    selector: '.tour-step-notifications',
    content: (
      <StepContent 
        title="Notifications" 
        text="Here is your notification icon. It will alert you to important updates, messages, or actions you need to take." 
      />
    ) as any,
  },
  {
    selector: '.tour-step-profile',
    content: (
      <StepContent 
        title="User Profile" 
        text="This is your user profile. Click here to manage your account settings, view your details, or log out." 
      />
    ) as any,
  },
];
