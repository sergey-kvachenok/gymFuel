# IndexedDB Style Guide

This guide outlines best practices for IndexedDB usage including data synchronization, multi-tab coordination, and offline-first patterns.

## Core Principles

- **Use the `idb` library**: Prefer the `idb` package (npm: `idb`) for promise-based APIs and safer transactions; avoid raw IDB unless necessary
- **Implement versioning**: Use database versioning to manage schema changes
- **Handle upgrades properly**: On upgrades, handle `onupgradeneeded`, `versionchange`, and `blocked` events; prompt other tabs to close and call `db.close()` on `versionchange`
- **Write idempotent upgrades**: Never drop stores/indices unless you have a safe migration/backup path

## Data Synchronization

- **Robust sync logic**: Ensure data synchronization logic is robust to handle online/offline transitions
- **Idempotent operations**: Implement idempotent operations and use multi-tab coordination mechanisms like BroadcastChannel or Service Worker to prevent duplicates and lost updates during synchronization
- **Queue offline writes**: Queue writes offline; replay with backoff when online
- **Multi-tab coordination**: Use `BroadcastChannel` or `postMessage` to coordinate multi-tab state
- **Stable sync operations**: Make sync operations idempotent (e.g., by using stable IDs and merge strategies) to tolerate retries

## Performance & Storage

- **Regular cleanup**: Regularly clean up old data to prevent storage bloat
- **TTL implementation**: Implement TTL/lastAccessed fields and periodic cleanup cursors; chunk deletes to avoid long transactions
- **Batch operations**: Batch writes/reads in as few transactions as possible; avoid many single-record transactions
- **Handle quota errors**: Handle `QuotaExceededError` and use `navigator.storage.persist()` to request persistent storage where appropriate

## Security & Compatibility

- **Feature detection**: Feature-detect (`'indexedDB' in window`) and gracefully degrade; note Safari Private Browsing can disable IDB
- **Encrypt sensitive data**: Don't store secrets/PII unencrypted; encrypt sensitive values client-side and avoid large base64 payloads (prefer Blob)
- **Database lifecycle**: Close databases when not in use; keep transactions short to reduce contention across tabs

## Query Optimization

- **Use indices**: Prefer indices and key ranges (`IDBKeyRange`) over full-store scans; paginate with cursors
