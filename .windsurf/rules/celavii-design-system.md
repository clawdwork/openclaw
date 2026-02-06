---
trigger: always_on
---

# Celavii Design System - Global Rules

## CRITICAL: All Pages Must Follow These Design Patterns

Every page in the Celavii platform MUST implement consistent design patterns, micro-interactions, and branding. This is a mandatory requirement.

---

## 1. Micro-Interactions (REQUIRED)

### Import Statement

```tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
```

### Standard Animation Variants (Copy these to every new page)

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};
```

### Required Hover Effects

- **Cards**: `whileHover={{ scale: 1.02, y: -4 }}` + `whileTap={{ scale: 0.98 }}`
- **Buttons**: `whileHover={{ scale: 1.01 }}` + `whileTap={{ scale: 0.99 }}`
- **Icons**: `whileHover={{ rotate: 5 }}`
- **List items**: `whileHover={{ x: 4 }}`

---

## 2. Color Palette

### Brand Colors (from brand.json)

```
Primary:     #0066FF (Celavii Blue)
Secondary:   #6366F1 (Indigo)
Accent:      #10B981 (Emerald)
Destructive: #EF4444 (Red)
Dark:        #1E293B (Slate)
Muted:       #F4F4F5 (Zinc)
Orange:      #F97316
Pink:        #EC4899
Purple:      #A855F7
```

### Brand Gradients

- **Primary (Blue→Cyan)**: `bg-gradient-to-r from-[#0066FF] to-[#00D4FF] bg-clip-text text-transparent`
- **Hero (Orange→Pink→Purple)**: `bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent`
- **Icon backgrounds**: `bg-gradient-to-br from-blue-100 to-indigo-100`
- **Focus states**: `focus:ring-[#0066FF]/20 focus:border-[#0066FF]`

### Backgrounds

- **Page**: `bg-gradient-to-b from-gray-50 to-white`
- **Cards**: `bg-white` with `border border-gray-100`
- **Dark sections**: `bg-gradient-to-br from-slate-800 to-slate-900`
- **Footer**: `bg-gray-900`

---

## 3. Typography

### Font Family

- **Primary/Body**: Inter, system-ui, sans-serif
- **Headings**: Inter, system-ui, sans-serif
- **Mono**: JetBrains Mono, monospace

### Headings with Gradient Emphasis

```tsx
// H1 - Primary Gradient (Blue→Cyan)
<h1 className="text-4xl md:text-5xl font-bold text-gray-900">
  Page{" "}
  <span className="bg-gradient-to-r from-[#0066FF] to-[#00D4FF] bg-clip-text text-transparent">
    Title
  </span>
</h1>

// H1 - Hero Gradient (Orange→Pink→Purple) - for marketing/hero sections
<h1 className="text-4xl md:text-5xl font-bold text-gray-900">
  Discover{" "}
  <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
    Creators
  </span>
</h1>

// H2
<h2 className="text-2xl font-bold text-gray-900">
  Section{" "}
  <span className="bg-gradient-to-r from-[#0066FF] to-[#00D4FF] bg-clip-text text-transparent">
    Title
  </span>
</h2>
```

---

## 4. Page Template Structure

```tsx
const PageTemplate = () => {
  return (
    <div className="flex flex-col py-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <motion.div
        className="content-container flex flex-col gap-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>{/* Content sections */}</motion.div>
      </motion.div>
    </div>
  );
};
```

---

## 5. Component Patterns

### Cards

```tsx
<motion.div
  variants={cardVariants}
  whileHover={{ scale: 1.02, y: -4 }}
  whileTap={{ scale: 0.98 }}
  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#0066FF]/20 transition-all"
>
```

### Primary Buttons

```tsx
<motion.button
  whileHover={{ scale: 1.01 }}
  whileTap={{ scale: 0.99 }}
  className="px-6 py-3 bg-[#0066FF] text-white font-medium rounded-xl hover:bg-[#0055DD] transition-colors"
>
  Action
</motion.button>
```

### Secondary Buttons

```tsx
<motion.button
  whileHover={{ scale: 1.01 }}
  whileTap={{ scale: 0.99 }}
  className="px-6 py-3 bg-white text-gray-900 font-medium rounded-xl border border-gray-200 hover:border-[#0066FF]/30 hover:bg-gray-50 transition-colors"
>
  Secondary
</motion.button>
```

### Form Inputs

```tsx
className =
  "h-11 px-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] hover:border-gray-300 transition-colors";
```

### Scroll Animations

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: index * 0.1 }}
>
```

### Icon Containers

```tsx
<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
  <Icon className="w-6 h-6 text-[#0066FF]" />
</div>
```

---

## 6. Accent Color Usage

| Context          | Color   | Tailwind Class                     |
| ---------------- | ------- | ---------------------------------- |
| Primary actions  | #0066FF | `bg-[#0066FF]` or `text-[#0066FF]` |
| Success states   | #10B981 | `text-emerald-500`                 |
| Warning states   | #F97316 | `text-orange-500`                  |
| Error states     | #EF4444 | `text-red-500`                     |
| Secondary/Indigo | #6366F1 | `text-indigo-500`                  |

---

## 7. Shadows & Borders

### Border Radius

```
sm:   0.25rem (rounded-sm)
md:   0.5rem  (rounded-md)
lg:   1rem    (rounded-lg)
xl:   1.5rem  (rounded-xl)
2xl:  2rem    (rounded-2xl)
3xl:  3rem    (rounded-3xl)
full: 9999px  (rounded-full)
```

### Shadows

```tsx
// Cards (default)
className = "shadow-sm";

// Cards (hover)
className = "hover:shadow-lg";

// Elevated elements
className = "shadow-md";

// Modals/Dropdowns
className = "shadow-xl";
```

---

## 8. Checklist Before Completing Any Page

- [ ] Uses `"use client"` directive
- [ ] Imports `motion` from `framer-motion`
- [ ] Container has staggered animation variants
- [ ] All cards have hover/tap effects
- [ ] Buttons have scale animations
- [ ] Headings use gradient text for emphasis (Blue→Cyan for app, Orange→Pink→Purple for marketing)
- [ ] Background uses `from-gray-50 to-white` gradient
- [ ] Icons use gradient backgrounds (`from-blue-100 to-indigo-100`)
- [ ] Forms have focus ring states with `#0066FF`
- [ ] Primary buttons use `#0066FF` background
- [ ] Border radius uses `rounded-xl` or `rounded-2xl` for modern feel

---

## 9. Brand Identity Reference

| Property          | Value                         |
| ----------------- | ----------------------------- |
| **Name**          | Celavii                       |
| **Tagline**       | Creator Intelligence Platform |
| **Website**       | https://celavii.com           |
| **Primary Font**  | Inter                         |
| **Primary Color** | #0066FF                       |
| **Hero Gradient** | Orange → Pink → Purple        |

---

---

## 10. Performance Optimization

### Animation Performance Rules

```tsx
// ✅ GPU-accelerated properties only
transform: (translateX(), translateY(), scale(), rotate());
opacity: 0 - 1;

// ❌ Avoid (causes reflow)
(width, height, top, left, margin, padding);
```

### Reduced Motion Support (REQUIRED)

```tsx
// Check user preference
const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Apply conditionally
const safeVariants = prefersReducedMotion ? { hidden: {}, visible: {} } : containerVariants;
```

### Lazy Animation Loading

```tsx
// Use Intersection Observer for below-fold content
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
>
```

---

## 11. Icon Library Standard

### Use lucide-react ONLY

```tsx
// ✅ Correct
import { Search, ChevronDown, X, Trash2, Plus, Settings } from "lucide-react";

// ❌ Incorrect (DO NOT USE)
import { ChevronUpIcon } from "@heroicons/react/20/solid";
```

### Icon Sizing

| Context     | Size | Class     |
| ----------- | ---- | --------- |
| Inline text | 16px | `w-4 h-4` |
| Buttons     | 20px | `w-5 h-5` |
| Standalone  | 24px | `w-6 h-6` |
| Feature     | 32px | `w-8 h-8` |

### Icon Container Pattern

```tsx
<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
  <Icon className="w-5 h-5 text-[#0066FF]" />
</div>
```

---

## 12. Dashboard-Specific Patterns

### Page Layout

```tsx
<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
  <motion.div
    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {/* Page content */}
  </motion.div>
</div>
```

### Data Table Rows

```tsx
<motion.tr
  whileHover={{ backgroundColor: 'rgba(0, 102, 255, 0.02)' }}
  className="border-b border-gray-100 transition-colors"
>
```

### Sidebar Menu Items

```tsx
<motion.button
  whileHover={{ x: 2, backgroundColor: "rgba(0, 102, 255, 0.05)" }}
  whileTap={{ scale: 0.98 }}
  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:text-[#0066FF] transition-colors"
>
  <Icon className="w-5 h-5" />
  <span>Menu Item</span>
</motion.button>
```

### Modal/Dialog Animation

```tsx
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-w-lg w-full"
      >
        {/* Modal content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

---

## Reference Files

- `.styles/celavii/brand.json` - Brand tokens and colors
- `Implementation/features/design-system/CELAVII-DESIGN-AUDIT.md` - Full audit & implementation plan
- `src/app/solutions/brands/components/BrandsHero.tsx` - Hero animation patterns
- `src/components/dashboard/BulkEnhanceModal.tsx` - Modal animation patterns
- `src/components/ui/` - Shared UI components
