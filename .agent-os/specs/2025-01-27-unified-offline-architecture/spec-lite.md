# Spec Summary (Lite)

Implement a unified offline-first architecture using IndexedDB as the single source of truth for all application data. Replace the current broken hybrid approach (Service Worker + IndexedDB + sync queue) with a simplified system where all CRUD operations write to IndexedDB first, then sync to server in background. This eliminates callback failures, race conditions, and complex synchronization logic while providing immediate UI updates and seamless offline experience.
