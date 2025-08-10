# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2024-07-22-pwa-offline-support/spec.md

## Changes

The following changes are required to support the "last write wins" synchronization strategy.

### New Columns

- A `lastUpdated` column will be added to the `Product`, `Consumption`, and `UserNutritionGoal` tables.

### Specifications

The following modifications should be made to the `prisma/schema.prisma` file:

```prisma
model Product {
  // ... existing fields
  lastUpdated DateTime @updatedAt
}

model Consumption {
  // ... existing fields
  lastUpdated DateTime @updatedAt
}

model UserNutritionGoal {
  // ... existing fields
  lastUpdated DateTime @updatedAt
}
```

### Rationale

The `@updatedAt` attribute in Prisma automatically updates the `lastUpdated` field to the current timestamp whenever a record is updated. This allows us to have a reliable timestamp for comparing the local data in IndexedDB with the server data during synchronization, ensuring that the most recent change is always preserved.
