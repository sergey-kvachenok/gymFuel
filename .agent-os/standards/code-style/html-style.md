# HTML Style Guide

## Structure Rules

- Use 2 spaces for indentation
- Place nested elements on new lines with proper indentation
- Content between tags should be on its own line when multi-line

## Attribute Formatting

- Place each HTML attribute on its own line
- Align attributes vertically
- Keep the closing `>` on the same line as the last attribute

## Clean Structure Principles

- **Minimize wrapper elements**: Use single wrapper elements when possible instead of nested containers
- **Combine related classes**: Apply related CSS classes to one element rather than creating extra divs
- **Question each wrapper**: Each wrapper should serve a distinct purpose
- **Prefer flat DOM**: Avoid deeply nested elements for better performance and maintainability

## Example HTML Structure

```html
<div class="container">
  <header
    class="flex flex-col space-y-2
                 md:flex-row md:space-y-0 md:space-x-4"
  >
    <h1 class="text-primary dark:text-primary-300">Page Title</h1>
    <nav
      class="flex flex-col space-y-2
                md:flex-row md:space-y-0 md:space-x-4"
    >
      <a href="/" class="btn-ghost"> Home </a>
      <a href="/about" class="btn-ghost"> About </a>
    </nav>
  </header>
</div>
```

## Bad vs Good Examples

**❌ Bad - Unnecessary nested wrapper:**

```html
<div class="w-full bg-red-600 text-white text-center py-2 px-4">
  <div class="flex items-center justify-center gap-2">
    <span>Content</span>
  </div>
</div>
```

**✅ Good - Single wrapper with combined classes:**

```html
<div
  class="w-full bg-red-600 text-white text-center py-2 px-4 flex items-center justify-center gap-2"
>
  <span>Content</span>
</div>
```
