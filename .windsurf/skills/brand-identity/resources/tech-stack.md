# Preferred Tech Stack & Implementation Rules

When generating code or UI components for this brand, you **MUST** strictly adhere to the following technology choices.

## Core Stack

| Layer          | Technology            | Notes                                        |
| -------------- | --------------------- | -------------------------------------------- |
| **Framework**  | React + TypeScript    | Prefer functional components with hooks      |
| **Styling**    | Tailwind CSS          | Mandatory. No plain CSS or styled-components |
| **Components** | shadcn/ui             | Use as base for all new components           |
| **Icons**      | Lucide React          | Do not use Font Awesome or other libraries   |
| **Charts**     | Recharts              | For data visualization                       |
| **State**      | React hooks / Zustand | Prefer local state when possible             |

## Implementation Guidelines

### 1. Tailwind Usage

**DO:**

- Use utility classes directly in JSX
- Use color tokens from `design-tokens.json` (e.g., `bg-primary text-primary-foreground`)
- Support dark mode using Tailwind's `dark:` variant
- Use responsive prefixes (`sm:`, `md:`, `lg:`) for responsive design

**DON'T:**

- Hardcode hex values in className
- Create separate CSS files
- Use `@apply` excessively

```tsx
// ✅ Correct
<button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2">
  Submit
</button>

// ❌ Wrong
<button style={{ backgroundColor: '#0066FF', color: 'white' }}>
  Submit
</button>
```

### 2. Component Patterns

#### Buttons

- **Primary actions**: Solid primary color (`bg-primary`)
- **Secondary actions**: Ghost or Outline variants from shadcn/ui
- **Destructive actions**: Use destructive color (`bg-destructive`)

#### Forms

- Labels **above** input fields (not inline)
- Use `gap-4` between form items
- Include error states with `text-destructive`

#### Cards

- Use `rounded-lg` or `rounded-xl` for card containers
- Default padding: `p-4` or `p-6`
- Border: `border border-border` or use shadows

#### Layout

- Use Flexbox (`flex`) for single-axis layouts
- Use Grid (`grid`) for two-dimensional layouts
- Consistent spacing: `gap-2`, `gap-4`, `gap-6`, `gap-8`

### 3. TypeScript Requirements

```tsx
// Always type props
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
}

// Use const assertions for static data
const CHART_COLORS = ["#0066FF", "#6366F1", "#10B981"] as const;
```

### 4. File Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   └── [feature]/    # Feature-specific components
├── lib/
│   └── utils.ts      # cn() helper, utilities
└── app/
    └── [route]/
        └── page.tsx  # Page components
```

### 5. Forbidden Patterns

| ❌ Do NOT Use      | ✅ Use Instead          |
| ------------------ | ----------------------- |
| jQuery             | React hooks             |
| Bootstrap          | Tailwind CSS            |
| Separate CSS files | Tailwind utilities      |
| Font Awesome       | Lucide React            |
| Class components   | Functional components   |
| `any` type         | Proper TypeScript types |
| `var`              | `const` or `let`        |

### 6. Performance Considerations

- Use `React.memo()` for expensive renders
- Lazy load heavy components with `React.lazy()`
- Use `useMemo` and `useCallback` appropriately
- Keep bundle size minimal - avoid unnecessary dependencies

### 7. Accessibility Requirements

- All interactive elements must be keyboard accessible
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Include `aria-label` for icon-only buttons
- Ensure sufficient color contrast (WCAG AA)
- Support reduced motion: `motion-reduce:transition-none`
