# React Query Style Guide

This guide outlines React Query best practices for queries, mutations, caching, and UI states.

## Query Management

- **Use query keys** to uniquely identify queries for caching and refetching
- **Implement background refetching** to keep data fresh
- **Use `useQuery` and `useMutation` hooks** for data fetching and state management

## User Experience

- **Handle loading and error states** in your UI for better user experience
- **Provide meaningful feedback** during data operations
- **Optimize for perceived performance** with proper loading states
