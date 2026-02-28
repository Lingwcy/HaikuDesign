---
name: comment
description: Generate beautiful and practical code comments for HaikuDesign project. Use when adding comments to components, props, functions, or types. Trigger with /comment or describe what you want to comment.
---

# HaikuDesign Comment Skill

When generating comments for this project, follow these guidelines:

## Component Comments

```tsx
/**
 * Primary button component
 *
 * @example
 * ```tsx
 * <Button variant="primary">Submit</Button>
 * ```
 */
```

**Rules**:
- Use English description
- Include @example for exported components
- Explain main purpose and use cases

## Props Comments

```tsx
interface ButtonProps {
  /** Button variant: primary-primary button, default-default, dashed-dashed border, filled-filled style, text-text only, link-link style */
  variant?: 'primary' | 'default' | 'dashed' | 'filled' | 'text' | 'link';
  /** Button color: default-default, primary-theme color, danger-danger/ red, info-info/ blue, success-success/ green, warning-warning/ amber */
  color?: 'default' | 'primary' | 'danger' | 'info' | 'success' | 'warning';
  /** Button size: sm-small, default-medium, lg-large */
  size?: 'sm' | 'default' | 'lg';
  /** Loading state, shows loading icon and disables interaction */
  loading?: boolean;
  /** Icon, can be Iconify name string or React node */
  icon?: string | React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Click event handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}
```

**Rules**:
- Use concise English description
- Explain each enum value meaning
- For boolean, describe behavior when true
- For functions, describe params and return value

## Utility Function Comments

```tsx
/**
 * Utility to merge classNames with tailwind-merge conflict resolution
 *
 * @param inputs - Class values to merge, supports string, array, object
 * @returns Merged className string
 *
 * @example
 * cn('px-2 py-1', { 'bg-red-500': isError })
 */
export function cn(...inputs: ClassValue[]) {
  // ...
}
```

## Type Comments

```tsx
/** Button variant type */
export type ButtonVariant = 'primary' | 'default' | 'dashed' | 'filled' | 'text' | 'link';

/** Button size type */
export type ButtonSize = 'sm' | 'default' | 'lg';
```

## Comment Position Rules

| Code Type | Position | Reason |
|-----------|----------|--------|
| Exported component | File top | Explain component purpose |
| Interface/Type | Above interface | Explain type usage |
| Props | Above property | Explain each prop |
| Function | Above function | Explain function and params |
| Complex logic | Above code line | Explain why |

## Content Rules

1. **Concise and accurate**: One sentence explanation
2. **English**: Project uses English comments
3. **Example first**: Provide @example for complex APIs
4. **Avoid redundant**: Don't comment obvious code

## When NOT to Comment

```tsx
// ❌ Don't add
const count = 0; // Define count variable

// ✅ Add
/** Async request timeout in milliseconds */
const REQUEST_TIMEOUT = 5000;
```

## Execution Steps

When user requests comments:

1. **Analyze code**: Understand the code functionality
2. **Determine position**: Choose appropriate comment position
3. **Generate comments**: Follow the above specifications
4. **Apply comments**: Use Edit tool to add comments to code
5. **Explain**: Tell user why the comments are written this way

## Important Notes

- Only add meaningful comments
- Keep comments updated when code changes
- Follow project's comment style consistency
