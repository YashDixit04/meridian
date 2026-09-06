import React from 'react';
import { Send, Crown, Gift } from 'lucide-react';

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  title: string;
  price: string;
  period: string;
  icon: React.ReactNode;
  features: PricingFeature[];
  buttonText: string;
  isPopular: boolean;
  highlighted: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    title: 'Pricing Starter',
    price: 'Free',
    period: '',
    icon: <Send size={48} className="text-blue-200 fill-blue-100" />,
    features: [
      { text: 'Unlimited leads', included: true },
      { text: 'Unlimited emails', included: true },
      { text: 'No Demo\'s branding', included: true },
      { text: 'Email automation', included: false },
      { text: 'Custom fields', included: false },
      { text: 'Pro templates', included: false },
      { text: 'Export leads and reports', included: false },
    ],
    buttonText: 'Start free trial',
    isPopular: false,
    highlighted: false,
  },
  {
    id: 'pro',
    title: 'Pricing Pro',
    price: '$14.99',
    period: '/ month',
    icon: <Crown size={48} className="text-orange-300 fill-orange-100" />,
    features: [
      { text: 'Unlimited leads', included: true },
      { text: 'Unlimited emails', included: true },
      { text: 'No Demo\'s branding', included: true },
      { text: 'Email automation', included: true },
      { text: 'Custom fields', included: true },
      { text: 'Pro templates', included: false },
      { text: 'Export leads and reports', included: false },
    ],
    buttonText: 'Sign up',
    isPopular: true,
    highlighted: true,
  },
  {
    id: 'saver',
    title: 'Pricing Saver',
    price: '$24.99',
    period: '/ month',
    icon: <Gift size={48} className="text-blue-300 fill-blue-100" />,
    features: [
      { text: 'Unlimited leads', included: true },
      { text: 'Unlimited emails', included: true },
      { text: 'No Demo\'s branding', included: true },
      { text: 'Email automation', included: true },
      { text: 'Custom fields', included: true },
      { text: 'Pro templates', included: true },
      { text: 'Export leads and reports', included: true },
    ],
    buttonText: 'Sign up',
    isPopular: false,
    highlighted: false,
  },
];
