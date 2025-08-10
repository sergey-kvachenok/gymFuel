# Prisma Style Guide

This guide outlines best practices for Prisma schema and data-access usage in this repository.

## Database Migrations

- **Prefer Prisma Migrate over `db push`**:
  - Local: `prisma migrate dev`
  - CI/Prod: `prisma migrate deploy`
  - Check in `prisma/migrations/`; never edit past migrations; avoid `db push` in prod

## Type Safety

- **Leverage Prisma's type safety** to prevent runtime errors:
  - Enable TypeScript `strict` (incl. `strictNullChecks`)
  - Use `Prisma.validator`, `select`, and `include` to shape types narrowly

## Code Generation

- **Run `prisma generate` deterministically**:
  - Execute in `postinstall` or build pipeline after schema changes
  - Pin Prisma/Node versions; avoid generating at request-time in serverless

## Error Handling and Transactions

- **Implement robust error handling and transactions**:
  - Use `$transaction` for multi-step writes
  - Map known error codes (e.g., P2002 unique violation) to domain errors; don't leak internals
  - Prefer parameterized `$queryRaw` over `$queryRawUnsafe`

## Connection and Runtime Best Practices

- **Connection management**:
  - Reuse a single `PrismaClient` instance; for serverless, use Data Proxy/Accelerate or a global
  - Limit queries (use `take`/`skip`) and avoid unbounded `findMany`
  - Fetch only required fields with `select` to reduce payload

## Tooling & CI

- **Development workflow**:
  - Add `prisma format` to CI/pre-commit
  - Add drift checks (`prisma migrate diff`) in CI
