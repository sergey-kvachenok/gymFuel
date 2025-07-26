'use client';
import { config, envInfo } from '../lib/config';

export default function EnvironmentBanner() {
  // Show banner only in non-production environments
  if (!config.features.showEnvironmentBanner) {
    return null;
  }

  const getBannerColor = () => {
    switch (envInfo.APP_ENV) {
      case 'development':
        return 'bg-green-600';
      case 'staging':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getBannerText = () => {
    switch (envInfo.APP_ENV) {
      case 'development':
        return '🚧 Development Environment';
      case 'staging':
        return '🔄 Staging Environment';
      default:
        return '⚙️ Test Environment';
    }
  };

  return (
    <div
      className={`${getBannerColor()} text-white py-1 px-4 text-center text-sm font-medium w-full`}
    >
      {getBannerText()} | {envInfo.baseUrl}
    </div>
  );
}
