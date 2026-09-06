/**
 * Tour popover style config for <TourProvider styles={...}>.
 * Extracted from App.tsx to keep the root component lean.
 *
 * We use a plain object cast to avoid the version mismatch between
 * @reactour/tour's exported StylesObj type and the actual runtime API.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tourStyles: any = {
  popover: (base: object) => ({
    ...base,
    backgroundColor: '#1B1C22',
    color: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  }),
  badge: (base: object) => ({ ...base, display: 'none' }),
  close: (base: object) => ({ ...base, color: '#FFFFFF', width: '12px', height: '12px' }),
  dot: (base: object, state: { current?: boolean } | undefined) => ({
    ...base,
    backgroundColor: state?.current ? '#FFFFFF' : '#363843',
    width: '8px',
    height: '8px',
    margin: '0 4px',
  }),
  controls: (base: object) => ({ ...base, marginTop: '24px' }),
};
