import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  text?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading...", className = "" }) => {
  return (
    <div className={`flex-1 w-full h-full flex flex-col items-center justify-center ${className}`}>
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      {text && <p className="text-grey-500 font-medium">{text}</p>}
    </div>
  );
};

export default Loader;
