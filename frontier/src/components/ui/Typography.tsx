
import React from 'react';
import { cn } from '../../lib/utils';

/* -------------------------------------------------------------------------- */
/*                                   DISPLAY                                  */
/* -------------------------------------------------------------------------- */

/**
 * DISPLAY 1
 * Use for Hero Titles or major landing page headings.
 * Size: 50px | Weight: Bold
 */
export function Display1({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={cn("text-[50px] leading-[54px] font-bold tracking-[-0.02em]", className)}>
      {children}
    </h1>
  );
}

/**
 * DISPLAY 2
 * Use for secondary hero headings.
 * Size: 44px | Weight: Bold
 */
export function Display2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-[44px] leading-[56px] font-bold tracking-[-0.02em]", className)}>
      {children}
    </h2>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  HEADINGS                                  */
/* -------------------------------------------------------------------------- */

/**
 * HEADING 1 (H1)
 * Use for Page Titles.
 * Size: 38px | Weight: SemiBold
 */
export function Heading1({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={cn("text-[38px] leading-[38px] font-semibold tracking-[-0.02em]", className)}>
      {children}
    </h1>
  );
}

/**
 * HEADING 2 (H2)
 * Use for major section titles.
 * Size: 34px | Weight: Bold
 */
export function Heading2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-[34px] leading-[42px] font-bold tracking-[-0.02em]", className)}>
      {children}
    </h2>
  );
}

/**
 * HEADING 3 (H3)
 * Use for subsection titles.
 * Size: 30px | Weight: SemiBold
 */
export function Heading3({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-[30px] leading-[30px] font-semibold tracking-[-0.02em]", className)}>
      {children}
    </h3>
  );
}

/**
 * HEADING 4 (H4)
 * Use for card titles or smaller sections.
 * Size: 26px | Weight: SemiBold
 */
export function Heading4({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h4 className={cn("text-[26px] leading-[26px] font-semibold tracking-[-0.02em]", className)}>
      {children}
    </h4>
  );
}

/**
 * HEADING 5 (H5)
 * Use for small widget titles.
 * Size: 24px | Weight: SemiBold
 */
export function Heading5({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h5 className={cn("text-[24px] leading-[24px] font-semibold tracking-[-0.01em]", className)}>
      {children}
    </h5>
  );
}

/**
 * HEADING 6 (H6)
 * Use for very small headings or sub-headers.
 * Size: 22px | Weight: SemiBold
 */
export function Heading6({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h6 className={cn("text-[22px] leading-[22px] font-semibold tracking-[-0.01em]", className)}>
      {children}
    </h6>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    LEAD                                    */
/* -------------------------------------------------------------------------- */

/**
 * LEAD TEXT
 * Use for introductory paragraphs or subtitles under H1/H2.
 * Size: 22px | Weight: Medium
 */
export function Lead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[22px] leading-[38px] font-medium tracking-[-0.01em]", className)}>
      {children}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  BODY TEXT                                 */
/* -------------------------------------------------------------------------- */

/**
 * BODY XL
 * Use for large emphasized body text.
 * Size: 20px | Weight: Medium
 */
export function BodyXL({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[20px] leading-[30px] font-medium", className)}>
      {children}
    </p>
  );
}

/**
 * BODY LG
 * Use for larger readability text (e.g., blog posts).
 * Size: 18px | Weight: Medium
 */
export function BodyLg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[18px] leading-[30px] font-medium", className)}>
      {children}
    </p>
  );
}

/**
 * BODY BASE
 * Standard body text for the application.
 * Size: 16px | Weight: Medium
 */
export function BodyBase({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[16px] leading-[25px] font-medium", className)}>
      {children}
    </p>
  );
}

/**
 * BODY SM
 * Smaller body text for dense information.
 * Size: 14px | Weight: Normal
 */
export function BodySm({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[14px] leading-[22px] font-normal", className)}>
      {children}
    </p>
  );
}

/**
 * BODY XS
 * Very small body text.
 * Size: 13px | Weight: Normal
 */
export function BodyXs({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[13px] leading-[20px] font-normal", className)}>
      {children}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   LABELS                                   */
/* -------------------------------------------------------------------------- */

/**
 * INPUT LABEL (BASE)
 * Standard label for form inputs, buttons, and navigation.
 * Size: 14px | Weight: Medium | Tight Line Height
 */
export function InputLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("text-[14px] leading-[14px] font-medium", className)}>
      {children}
    </label>
  );
}

/**
 * LABEL LG
 * Large label for big buttons or highlighted UI elements.
 * Size: 16px | Weight: SemiBold | Tight Line Height
 */
export function LabelLg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-[16px] leading-[16px] font-semibold", className)}>
      {children}
    </span>
  );
}

/**
 * LABEL SM
 * Small label for dense UI, secondary buttons.
 * Size: 13px | Weight: Medium | Tight Line Height
 */
export function LabelSm({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-[13px] leading-[14px] font-medium", className)}>
      {children}
    </span>
  );
}

/**
 * LABEL XS
 * Extra small label for badges, tags, or status indicators.
 * Size: 12px | Weight: Medium | Tight Line Height
 */
export function LabelXs({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-[12px] leading-[12px] font-medium", className)}>
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   CAPTION                                  */
/* -------------------------------------------------------------------------- */

/**
 * CAPTION
 * Helper text, metadata, or descriptive subtitles.
 * Size: 12px | Weight: Normal | Relaxed Line Height
 */
export function Caption({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[12px] leading-[19px] font-normal", className)}>
      {children}
    </p>
  );
}

/**
 * MICRO TEXT
 * Copyright footers, legal text.
 * Size: 11px | Weight: Normal
 */
export function Micro({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] leading-[12px] font-normal", className)}>
      {children}
    </p>
  );
}

/**
 * OVERLINE
 * Uppercase tracking text for eyebrows or category tags.
 * Size: 11px | Weight: Medium | Wide Tracking
 */
export function Overline({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-[11px] leading-[12px] font-medium tracking-[0.03em] uppercase", className)}>
      {children}
    </span>
  );
}
