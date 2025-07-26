import React from 'react';

type MacroInfoProps = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  className?: string;
  textSize?: 'xs' | 'sm' | 'base';
  showLabels?: boolean;
  showInfoIcon?: boolean;
  tooltipContent?: string;
};

const MacroInfo: React.FC<MacroInfoProps> = ({
  calories,
  protein,
  fat,
  carbs,
  className = '',
  textSize = 'xs',
  showLabels = true,
}) => {
  const textSizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
  }[textSize];

  return (
    <div
      className={`flex flex-wrap gap-4 items-center ${textSizeClass} text-gray-700 ${className}`}
    >
      {showLabels ? (
        <>
          <span>
            <b>Calories:</b> {calories} cal/100g
          </span>
          <span>
            <b>Protein:</b> {protein}g
          </span>
          <span>
            <b>Fat:</b> {fat}g
          </span>
          <span>
            <b>Carbs:</b> {carbs}g
          </span>
        </>
      ) : (
        <>
          <span>{calories} cal</span>
          <span>P: {protein}g</span>
          <span>F: {fat}g</span>
          <span>C: {carbs}g</span>
        </>
      )}
    </div>
  );
};

export default MacroInfo;
