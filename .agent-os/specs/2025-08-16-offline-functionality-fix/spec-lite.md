# Spec Summary (Lite)

Complete the migration to unified offline-first architecture by refactoring all React hooks to use UnifiedDataService as the single source of truth, properly initializing the background sync system, and removing all hybrid logic. This will fix the current offline functionality issues where items are not saved to IndexedDB, users can't see data offline, and there's no synchronization between IndexedDB and server.
