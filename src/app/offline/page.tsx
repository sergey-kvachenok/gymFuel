import { FC } from 'react';

const OfflinePage: FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You&apos;re Offline
        </h1>
        <p className="text-gray-600 mb-4">
          Don&apos;t worry! You can still view your cached data and add new entries.
        </p>
        <p className="text-sm text-gray-500">
          Your changes will sync when you&apos;re back online.
        </p>
      </div>
    </div>
  );
};

export default OfflinePage;