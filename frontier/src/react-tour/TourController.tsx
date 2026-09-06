import React, { useEffect } from 'react';
import { useTour } from '@reactour/tour';
import { authService } from '../services/authService';

export const TourController: React.FC = () => {
  const { setIsOpen } = useTour();

  useEffect(() => {
    // Only check if they are authenticated
    if (authService.isAuthenticated()) {
      const hasSeenTour = localStorage.getItem('hasSeenTour');
      if (!hasSeenTour) {
        // Delay slightly to ensure UI is fully rendered
        const timer = setTimeout(() => {
          setIsOpen(true);
          localStorage.setItem('hasSeenTour', 'true');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [setIsOpen]);

  return null; // This component does not render anything
};
