import React from 'react';

interface SimpleTooltipProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const tooltipConfig = {
  top: {
    position: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    arrow:
      'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900',
  },
  bottom: {
    position: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    arrow:
      'bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900',
  },
  left: {
    position: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    arrow:
      'left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900',
  },
  right: {
    position: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    arrow:
      'right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900',
  },
};

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  trigger,
  content,
  position = 'top',
  className = '',
}) => {
  const config = tooltipConfig[position];

  return (
    <div className={`relative group overflow-visible ${className}`}>
      {trigger}
      <div
        className={`absolute ${config.position} px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs`}
      >
        {content}
        <div className={`absolute ${config.arrow}`}></div>
      </div>
    </div>
  );
};

export default SimpleTooltip;
