'use client';

import React, { FC } from 'react';

import { useOnlineStatus } from '../hooks/use-online-status';

const OfflineBanner: FC = () => {
  const isOnline = useOnlineStatus();

  // Don't render anything when online
  if (isOnline) {
    return null;
  }

  return (
    <div className="w-full bg-red-600 text-white text-center py-2 px-4 shadow-md flex items-center justify-center gap-2">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      <span className="text-sm font-medium">
        You are currently offline. Some features may not be available.
      </span>
    </div>
  );
};

export default OfflineBanner;
