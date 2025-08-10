# React & Next.js Style Guide

This guide outlines the conventions for writing clean, reusable, and efficient React and Next.js code, focusing on component structure, code organization, and performance.

## Component Structure

- **Functional Components**: Prefer using functional components with the `FC` (Function Component) type annotation. For example: `const Element: FC<IElementProps> = () => {}`
- **Logic Separation**: If a component contains complex business logic (e.g., fetching data, managing state, handling multiple side effects), extract that logic into a separate custom hook or class. This improves component readability, testability, and reusability
- **Composition**: Components should ideally be concise, with a maximum of 130 lines. If a component grows too large, refactor its functionality into smaller, specialized components and compose them within the parent component

## File Organization

- **Feature-Specific Components**: If a component is specific to a single feature and unlikely to be reused, place it in a `components` subfolder within the parent feature directory
- **Shared Components**: If a component has potential for reuse, place it in a shared components folder (e.g., `src/components/shared`)
- **Helper Functions & Constants**: Similarly, feature-specific utilities, helpers, or constants should be in a `utils` or `helpers` subfolder within the parent feature directory. Reusable utilities should be in a shared utils folder. Before creating new utilities or components, always check for existing functionality to avoid duplication. If there is a similar utility, use it or refactor it to be more generic

## Server-Side Rendering (SSR)

- **Prioritize SSR**: Strive to use SSR whenever possible to improve initial load performance and SEO
- **Third-Party Compatibility**: Ensure that all third-party libraries, especially those for authentication, state management (e.g., tRPC, GraphQL), or internationalization (i18n), are compatible with both server-side and client-side rendering

## Performance Optimization

- **Memoization**: To prevent unnecessary re-renders, wrap components in `React.memo()`. This is particularly useful for components that receive the same props frequently
- **Prop Memoization**: When a component is wrapped in `React.memo()`, ensure that any props that are objects, arrays, or functions are also memoized using `useMemo` or `useCallback` respectively
- **Memoized Methods in Hooks**: Inside custom hooks or components, any methods that are passed down to child components or are dependencies for other hooks (`useEffect`, `useMemo`) should be wrapped in `useCallback` to maintain referential equality and prevent infinite re-renders

## Code Reuse and Duplication

- **Don't Repeat Yourself (DRY)**: Before creating a new component, utility, or constant, check if a similar one already exists. If so, either reuse it directly or refactor the existing code to be more generic and reusable. If a constant is used more than once, it should be extracted and reused from a central location to prevent duplication

## Testing

- **Unit Testing**: All utilities, helpers, and complex logic should be covered with unit tests. It is recommended to use a Test-Driven Development (TDD) approach where tests are written before the code itself
- **E2E Testing**: Implement end-to-end (E2E) tests using Playwright to ensure critical user flows are working as expected
