import React from 'react';
import { BellOff, RefreshCw, Scan, Clock, Users } from "lucide-react";

// data/highlightsData.ts
export interface MetricItem {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change: {
    value: number;
    isPositive: boolean;
  };
}

export const totalRevenue = {
  amount: "$295.7k",
  change: {
    value: 2.7,
    isPositive: true,
  },
};

export const breakdown = [
  { color: "bg-success", label: "Subscribers", percentage: 50 },
  { color: "bg-warning", label: "Supplies", percentage: 30 },
  { color: "bg-info", label: "Others", percentage: 20 },
];

export const metrics: MetricItem[] = [
  {
    icon:   RefreshCw,
    label: "Renewal Rate",
    value: "12",
    change: { value: 0.7, isPositive: false },
  },
  {
    icon: Users,
    label: "Active Users",
    value: "21,000",
    change: { value: 3.9, isPositive: true },
  },
  {
    icon: Clock,
    label: "Active Subscriptions",
    value: "42,112",
    change: { value: 0.7, isPositive: false },
  },
  {
    icon: Scan,
    label: "New Signups",
    value: "12,000",
    change: { value: 1.5, isPositive: true },
  },
  {
    icon: BellOff,
    label: "Expired Plans",
    value: "02",
    change: { value: 1.2, isPositive: false }, // note: your original shows ↑ but ↓ color – pick one
  },
];