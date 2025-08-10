# NextAuth Style Guide

This guide outlines best practices for using NextAuth (next-auth) in Next.js: security, sessions, callbacks, middleware, and operational hygiene.

## Session Management

- **JWT vs Database sessions**: Prefer JWT sessions only when you need stateless scaling; otherwise consider database sessions for server-side invalidation and single sign-out
- **Session configuration**: Configure `session.maxAge` and `updateAge` to match business requirements
- **Refresh token handling**: If using refresh tokens with providers, rotate and store them securely on the server; revoke on sign-out when possible

## Security Configuration

- **Environment variables**: Set `NEXTAUTH_SECRET`, use secure HTTP-only cookies in production, and configure `sameSite=lax` (or strict) and proper cookie domain
- **Token security**: Never expose provider tokens to the client
- **JWT content**: Keep JWTs small and non-PII: include only stable identifiers (sub), roles/permissions, org/tenant IDs
- **Session data**: Put only safe claims into session via the session callback; fetch sensitive data server-side as needed

## Route Protection

- **Middleware usage**: Protect routes with middleware (`withAuth`/`auth`) and an authorized callback
- **Server-side enforcement**: Enforce RBAC/ABAC on the server; don't rely on client-only checks
- **HTTP method validation**: Validate HTTP methods and return 401/403 appropriately

## Operational Hygiene

- **Logging security**: Avoid logging tokens or PII
- **Rate limiting**: Add rate limiting to credentials flows and monitor repeated 401s
- **Testing coverage**: Test expiry, unauthorized access, and role-based route coverage
