'use client';
import { useState, useEffect } from 'react';

export default function EnvironmentBanner() {
  const [mounted, setMounted] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Client-side only URL detection
    setBaseUrl(window.location.origin);
    
    // Client-side only environment check to prevent hydration mismatch
    const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development';
    setShowBanner(APP_ENV !== 'production');
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || !showBanner) {
    return null;
  }

  const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development';

  const getBannerColor = () => {
    switch (APP_ENV) {
      case 'development':
        return 'bg-green-600';
      case 'staging':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getBannerText = () => {
    switch (APP_ENV) {
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
      {getBannerText()} | {baseUrl}
    </div>
  );
}
