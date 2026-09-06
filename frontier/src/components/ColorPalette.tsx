import React from 'react';
import { THEME_COLORS, NEUTRAL_COLORS, GREY_COLORS } from '../style/constants';

interface ColorPaletteProps {
  isDarkMode: boolean;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ isDarkMode }) => {
  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-grey-900">Brand Colors</h2>
        <p className="text-grey-600 dark:text-grey-600 max-w-2xl">
          Our core color palette used across the B2B dashboard. These colors automatically adjust based on the selected theme.
        </p>
      </div>

      {/* Main Colors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {THEME_COLORS.map((group) => (
          <div key={group.key} className="flex flex-col gap-3">
             <h3 className="font-semibold text-lg capitalize mb-2">{group.name}</h3>
            {group.variants.map((variant) => {
              const hex = isDarkMode ? variant.dark : variant.light;
              if (hex === null && isDarkMode) return null; // Skip accents in dark mode if null

              return (
                <div key={variant.name} className="flex items-center gap-3 group">
                  <div 
                    className={`w-20 h-16 rounded-lg shadow-sm ring-1 ring-inset ring-black/5 ${variant.token} transition-colors duration-300`}
                    title={`${variant.name}: ${hex}`}
                  ></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-grey-900 dark:text-grey-900">{variant.name}</span>
                    <span className="text-xs text-grey-500 font-mono">{hex}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Neutrals Grid */}
      <div className="space-y-4 pt-8 border-t border-grey-200 dark:border-grey-700">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-grey-900">Neutral Colors</h2>
        <p className="text-grey-600 dark:text-grey-600">
           Semantic neutral tokens for surfaces, text, and backgrounds. Note how "Dark" and "Light" roles invert in Dark Mode.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {NEUTRAL_COLORS.map((group) => (
            <div key={group.key} className="space-y-4">
               <h3 className="font-semibold text-lg capitalize">{group.name}</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {group.variants.map((variant) => {
                    const hex = isDarkMode ? variant.dark : variant.light;
                    return (
                        <div key={variant.name} className="flex items-center gap-4 p-3 rounded-xl border border-grey-100 dark:border-grey-800 bg-white dark:bg-black/5">
                            <div className={`w-16 h-16 rounded-lg shadow-sm ring-1 ring-black/5 ${variant.token}`}></div>
                            <div className="flex flex-col">
                                <span className="font-medium text-grey-900 dark:text-grey-900">{variant.name}</span>
                                <span className="text-xs text-grey-500 font-mono">{hex}</span>
                            </div>
                        </div>
                    )
                 })}
               </div>
            </div>
          ))}
      </div>

      {/* Grey Scale */}
      <div className="space-y-4 pt-8 border-t border-grey-200 dark:border-grey-700">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-grey-900">Grey Scale</h2>
        <p className="text-grey-600 dark:text-grey-600">
           A balanced grey scale for UI elements, borders, and subtle text.
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {GREY_COLORS.map((grey) => {
             const hex = isDarkMode ? grey.dark : grey.light;
             return (
               <div key={grey.name} className="flex flex-col gap-2 p-2">
                 <div className={`w-full h-24 rounded-lg shadow-sm ring-1 ring-black/5 ${grey.token}`}></div>
                 <div className="flex flex-col px-1">
                    <span className="text-sm font-semibold text-grey-800 dark:text-grey-800">{grey.name}</span>
                    <span className="text-xs text-grey-500 font-mono">{hex}</span>
                 </div>
               </div>
             )
          })}
      </div>
    </div>
  );
};

export default ColorPalette;