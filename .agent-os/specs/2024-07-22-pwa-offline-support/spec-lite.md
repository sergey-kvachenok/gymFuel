# Spec Summary (Lite)

Implement a full offline mode using IndexedDB (via Dexie.js) that allows users to create, read, update, and delete products, consumption, and goals. All offline changes will be automatically synced to the server upon reconnection, with a "last write wins" conflict resolution strategy.
