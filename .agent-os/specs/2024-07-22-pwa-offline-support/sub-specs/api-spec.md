# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2024-07-22-pwa-offline-support/spec.md

## Endpoints

### `POST /api/trpc/sync.batchSync`

**Purpose:** This new tRPC endpoint will receive a batch of offline changes from the client and apply them to the database.

**Parameters:**

- `operations`: An array of objects, where each object represents a single CRUD operation.
  - `type`: The type of operation (`'create'`, `'update'`, `'delete'`).
  - `entity`: The type of entity being modified (`'product'`, `'consumption'`, `'goal'`).
  - `data`: The data for the operation. For `create` and `update`, this will be the full record. For `delete`, this will be the ID of the record.
  - `lastUpdated`: The timestamp of when the change was made on the client.

**Response:**

- On success, it will return an array of the successfully synced operations.
- On failure, it will return a tRPC error with details about which operations failed and why.

**Errors:**

- **UNAUTHORIZED**: If the user is not authenticated.
- **BAD_REQUEST**: If the input data is malformed.
- **CONFLICT**: If a conflict is detected and cannot be resolved automatically (though the "last write wins" strategy should minimize this).
- **INTERNAL_SERVER_ERROR**: For any other server-side errors.
