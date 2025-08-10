# TypeScript Style Guide

This guide outlines the conventions for writing clean, readable, and consistent TypeScript code. It emphasizes strong typing, clear naming, and structured formatting.

## General Formatting

- Use 2 spaces for indentation
- Place curly braces `{}` on the same line as the statement they belong to (e.g., for if, for, function)
- Always use semicolons at the end of statements
- Keep lines concise; aim for a maximum of 100-120 characters per line. Break up long lines to improve readability

## Naming Conventions

- Use camelCase for variable names, function names, and properties (e.g., `userProfile`, `getUsers`)
- Use PascalCase for class names, interface names, and type aliases (e.g., `UserProfile`, `UserProps`)
- Use `UPPER_SNAKE_CASE` for constants (e.g., `API_URL`, `MAX_RETRIES`)
- Use descriptive and meaningful names. Avoid single-letter variables unless they are a loop counter (e.g., `i`, `j`)

## Type Annotations and Interfaces

- Explicitly type all variables, function parameters, and return values. Avoid using `any` unless absolutely necessary
- Interfaces are preferred over type aliases for defining object shapes
- To minimize duplication and promote code reuse, extend interfaces when creating new interfaces with similar properties. This is especially useful for creating specific types from a generic base

## Example Interface Structure

```typescript
interface IBaseButton {
  color: string;
  size: number;
}

interface IRoundButton extends IBaseButton {
  variant: 'round';
}
```

## Function and Arrow Function Formatting

- Arrow functions (`const func = () => {}`) are preferred for new function declarations
- For functions with multiple parameters, place each parameter on a new line with indentation
- If an arrow function's body is a single expression, it can be on a single line. If it's a block of code, use a new line with indentation

## Example Function Structure

```typescript
const fetchUser = async (userId: string, includeDetails: boolean): Promise<User> => {
  // Function body
  return axios.get(`/api/users/${userId}`);
};

const formatName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

const users = data.map((user) => ({
  id: user.id,
  name: user.name,
}));
```

## Imports and Exports

- Group imports by type:
  - Third-party packages
  - Project-specific components
  - Relative file imports
- Use a blank line to separate import groups
- Sort imports alphabetically within each group for consistency
- Place multi-line imports on new lines with proper indentation

## Example Import Structure

```typescript
import React, { FC } from 'react';
import { Button } from '@radix-ui/react-button';

import { cn } from '@/lib/utils';
import UserProfile from '@/components/UserProfile';
import { User } from '@/types/user';
```

## Code Reuse and Utilities

- Avoid code duplication. Before writing new code, check if a similar utility or function already exists
- If you create a generic function or utility that can be reused across your project, it should be placed in a shared utility folder. This helps keep the codebase DRY (Don't Repeat Yourself) and makes common logic easy to find and maintain. The specific folder name (e.g., `utils`, `lib`, `shared`) depends on the project's structure
- If I am creating a new utility function and am unsure of the correct location to place it, I will ask for clarification and explain why the placement is important for code organization
