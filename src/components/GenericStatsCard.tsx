import React from 'react';

interface StatsCardMessageProps {
  title: string;
  message: string;
  color?: string;
}

const StatsCardMessage: React.FC<StatsCardMessageProps> = ({
  title,
  message,
  color = 'text-gray-500',
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <div className={color}>{message}</div>
  </div>
);

export default StatsCardMessage;
