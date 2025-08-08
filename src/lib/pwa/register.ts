export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      registration.addEventListener('updatefound', () => {
        console.log('New service worker available');
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};