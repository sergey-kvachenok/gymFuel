import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateNutrients = (consumption: {
  amount: number;
  product: { calories: number; protein: number; fat: number; carbs: number };
}) => {
  const ratio = consumption.amount / 100;
  return {
    calories: Math.round(consumption.product.calories * ratio),
    protein: Math.round(consumption.product.protein * ratio * 10) / 10,
    fat: Math.round(consumption.product.fat * ratio * 10) / 10,
    carbs: Math.round(consumption.product.carbs * ratio * 10) / 10,
  };
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${ampm}`;
};

export const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
