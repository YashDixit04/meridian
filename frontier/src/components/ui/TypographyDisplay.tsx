
import React from 'react';

interface TypeSpec {
  name: string;
  weightLabel: string;
  weight: number;
  size: number;
  lineHeight: number;
  spacing: number;
}

const typographyData: TypeSpec[] = [
  { name: 'H-50-54-700', weightLabel: 'Bold 700', weight: 700, size: 50, lineHeight: 54, spacing: -2 },
  { name: 'H-44-56-700', weightLabel: 'Bold 700', weight: 700, size: 44, lineHeight: 56, spacing: -2 },
  { name: 'H-38-38-600', weightLabel: 'SemiBold 600', weight: 600, size: 38, lineHeight: 38, spacing: -2 },
  { name: 'H-34-42-700', weightLabel: 'Bold 700', weight: 700, size: 34, lineHeight: 42, spacing: -2 },
  { name: 'H-34-34-600', weightLabel: 'SemiBold 600', weight: 600, size: 34, lineHeight: 34, spacing: -2 },
  { name: 'H-30-30-600', weightLabel: 'SemiBold 600', weight: 600, size: 30, lineHeight: 30, spacing: -2 },
  { name: 'H-26-26-600', weightLabel: 'SemiBold 600', weight: 600, size: 26, lineHeight: 26, spacing: -2 },
  { name: 'H-24-24-600', weightLabel: 'SemiBold 600', weight: 600, size: 24, lineHeight: 24, spacing: -1 },
  { name: 'H-22-38-500', weightLabel: 'Medium 500', weight: 500, size: 22, lineHeight: 38, spacing: -1 },
  { name: 'H-22-22-600', weightLabel: 'SemiBold 600', weight: 600, size: 22, lineHeight: 22, spacing: -1 },
  { name: 'B-20-30-500', weightLabel: 'Medium 500', weight: 500, size: 20, lineHeight: 30, spacing: 0 },
  { name: 'B-20-20-500', weightLabel: 'Medium 500', weight: 500, size: 20, lineHeight: 30, spacing: 0 }, 
  { name: 'B-20-20-600', weightLabel: 'SemiBold 600', weight: 600, size: 20, lineHeight: 30, spacing: 0 },
  { name: 'B-18-30-500', weightLabel: 'Medium 500', weight: 500, size: 18, lineHeight: 30, spacing: 0 },
  { name: 'B-18-25-300', weightLabel: 'Light 300', weight: 300, size: 18, lineHeight: 25, spacing: 0 },
  { name: 'B-18-25-500', weightLabel: 'Medium 500', weight: 500, size: 18, lineHeight: 25, spacing: 0 },
  { name: 'B-18-25-600', weightLabel: 'SemiBold 600', weight: 600, size: 18, lineHeight: 25, spacing: 0 },
  { name: 'B-18-18-500', weightLabel: 'Medium 500', weight: 500, size: 18, lineHeight: 18, spacing: -1 },
  { name: 'B-18-18-600', weightLabel: 'SemiBold 600', weight: 600, size: 18, lineHeight: 18, spacing: -1 },
  { name: 'B-16-25-500', weightLabel: 'Medium 500', weight: 500, size: 16, lineHeight: 25, spacing: 0 },
  { name: 'B-16-25-600', weightLabel: 'SemiBold 600', weight: 600, size: 16, lineHeight: 25, spacing: 0 },
  { name: 'B-16-16-400', weightLabel: 'Regular 400', weight: 400, size: 16, lineHeight: 16, spacing: 0 },
  { name: 'B-16-16-500', weightLabel: 'Medium 500', weight: 500, size: 16, lineHeight: 16, spacing: 0 },
  { name: 'B-16-16-600', weightLabel: 'SemiBold 600', weight: 600, size: 16, lineHeight: 16, spacing: 0 },
  { name: 'B-15-24-400', weightLabel: 'Regular 400', weight: 400, size: 15, lineHeight: 24, spacing: 0 },
  { name: 'B-15-24-500', weightLabel: 'Medium 500', weight: 500, size: 15, lineHeight: 24, spacing: 0 },
  { name: 'B-15-16-400', weightLabel: 'Regular 400', weight: 400, size: 15, lineHeight: 16, spacing: 0 },
  { name: 'B-15-16-500', weightLabel: 'Medium 500', weight: 500, size: 15, lineHeight: 16, spacing: 0 },
  { name: 'B-15-16-600', weightLabel: 'SemiBold 600', weight: 600, size: 15, lineHeight: 16, spacing: 0 },
  { name: 'B-14-22-400', weightLabel: 'Regular 400', weight: 400, size: 14, lineHeight: 22, spacing: 0 },
  { name: 'B-14-22-500', weightLabel: 'Medium 500', weight: 500, size: 14, lineHeight: 22, spacing: 0 },
  { name: 'B-14-14-400', weightLabel: 'Regular 400', weight: 400, size: 14, lineHeight: 14, spacing: 0 },
  { name: 'B-14-14-500', weightLabel: 'Medium 500', weight: 500, size: 14, lineHeight: 14, spacing: 0 },
  { name: 'B-14-14-600', weightLabel: 'SemiBold 600', weight: 600, size: 14, lineHeight: 14, spacing: 0 },
  { name: 'B-14-14-700', weightLabel: 'Bold 700', weight: 700, size: 14, lineHeight: 14, spacing: 0 },
  { name: 'B-13-20-400', weightLabel: 'Regular 400', weight: 400, size: 13, lineHeight: 20, spacing: 0 },
  { name: 'B-13-20-500', weightLabel: 'Medium 500', weight: 500, size: 13, lineHeight: 20, spacing: 0 },
  { name: 'B-13-14-400', weightLabel: 'Regular 400', weight: 400, size: 13, lineHeight: 14, spacing: 0 },
  { name: 'B-13-14-500', weightLabel: 'Medium 500', weight: 500, size: 13, lineHeight: 14, spacing: 0 },
  { name: 'B-13-14-600', weightLabel: 'SemiBold 600', weight: 600, size: 13, lineHeight: 14, spacing: 0 },
  { name: 'B-13-14-700', weightLabel: 'Bold 700', weight: 700, size: 13, lineHeight: 14, spacing: 0 },
  { name: 'B-12-18-400', weightLabel: 'Regular 400', weight: 400, size: 12, lineHeight: 19, spacing: 0 },
  { name: 'B-12-12-400', weightLabel: 'Regular 400', weight: 400, size: 12, lineHeight: 12, spacing: 0 },
  { name: 'B-12-12-500', weightLabel: 'Medium 500', weight: 500, size: 12, lineHeight: 12, spacing: 0 },
  { name: 'B-12-12-600', weightLabel: 'SemiBold 600', weight: 600, size: 12, lineHeight: 12, spacing: 0 },
  { name: 'B-12-12-700', weightLabel: 'Bold 700', weight: 700, size: 12, lineHeight: 12, spacing: 0 },
  { name: 'B-11-12-400', weightLabel: 'Regular 400', weight: 400, size: 11, lineHeight: 12, spacing: 0 },
  { name: 'B-11-12-500', weightLabel: 'Medium 500', weight: 500, size: 11, lineHeight: 12, spacing: 0 },
  { name: 'B-11-12-600', weightLabel: 'Medium 500', weight: 500, size: 11, lineHeight: 12, spacing: 3 },
  { name: 'B-10-10-400', weightLabel: 'Regular 400', weight: 400, size: 10, lineHeight: 10, spacing: -3 },
  { name: 'B-10-10-500', weightLabel: 'Medium 500', weight: 500, size: 10, lineHeight: 10, spacing: -3 },
  { name: 'B-10-10-600', weightLabel: 'SemiBold 600', weight: 600, size: 10, lineHeight: 10, spacing: 3 },
  { name: 'B-9-10-400', weightLabel: 'Regular 400', weight: 400, size: 9, lineHeight: 10, spacing: -3 },
  { name: 'B-9-10-500', weightLabel: 'Medium 500', weight: 500, size: 9, lineHeight: 10, spacing: -3 },
  { name: 'B-9-10-600', weightLabel: 'SemiBold 600', weight: 600, size: 9, lineHeight: 10, spacing: -3 },
];

const TypographyDisplay: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-8 pt-0 space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-white">Typography</h2>
        <p className="text-grey-600 dark:text-grey-500 max-w-2xl">
          A comprehensive type scale with defined weights, line heights, and letter spacing.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-grey-200 dark:border-grey-800 bg-white dark:bg-light-active shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-grey-50 dark:bg-grey-50 text-grey-500 dark:text-grey-600 font-medium border-b border-grey-200 dark:border-grey-800">
            <tr>
              <th scope="col" className="px-6 py-4 w-[40%]">Name</th>
              <th scope="col" className="px-6 py-4 w-[15%]">Weight</th>
              <th scope="col" className="px-6 py-4 w-[15%] text-right">Size</th>
              <th scope="col" className="px-6 py-4 w-[15%] text-right">Line Height</th>
              <th scope="col" className="px-6 py-4 w-[15%] text-right">Spacing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dashed divide-grey-200 dark:divide-grey-800">
            {typographyData.map((item, index) => (
              <tr key={index} className="hover:bg-grey-50 dark:hover:bg-grey-100 transition-colors">
                <td className="px-6 py-4 text-grey-900 dark:text-white">
                  <span 
                    style={{
                      fontWeight: item.weight,
                      fontSize: `${item.size}px`,
                      lineHeight: `${item.lineHeight}px`,
                      letterSpacing: `${item.spacing / 100}em`, 
                    }}
                    className="block truncate"
                  >
                    {item.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-grey-500 dark:text-grey-600 font-mono text-xs">
                  {item.weightLabel}
                </td>
                <td className="px-6 py-4 text-right text-grey-500 dark:text-grey-600 font-mono text-xs">
                  {item.size}
                </td>
                <td className="px-6 py-4 text-right text-grey-500 dark:text-grey-600 font-mono text-xs">
                  {item.lineHeight}
                </td>
                <td className="px-6 py-4 text-right text-grey-500 dark:text-grey-600 font-mono text-xs">
                  {item.spacing}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TypographyDisplay;
