# Medixra UI - Architecture & Best Practices Guide

## Overview
This document outlines the architectural improvements made to the Medixra UI project and provides guidelines for maintaining consistency going forward.

---

## 1. TypeScript & Type Safety

### Changes Made
- ✅ Enabled strict TypeScript mode in `tsconfig.json`
- ✅ Added `strictNullChecks`, `noImplicitAny`, `noImplicitThis`
- ✅ Disabled `ignoreBuildErrors` - now enforces type safety

### Guidelines for Contributors
- Always use explicit types for component props:
  ```typescript
  interface ProductCardProps {
    product: Product
    onSelect?: (id: string) => void
  }
  ```
- Use `satisfies` operator for type narrowing:
  ```typescript
  const config = { /* ... */ } satisfies Config
  ```
- Avoid `any` type - use `unknown` with type guards instead
- Create shared types in `types/` directory for cross-component use

---

## 2. Design System & Colors

### Tailwind Configuration
The project uses shadcn/ui with Tailwind CSS 4.x and OKLch color space.

### Color Tokens
All colors are defined as CSS variables in `app/globals.css`:
- `--primary`: oklch(0.52 0.12 195) - Main brand blue
- `--secondary`: oklch(0.97 0 0) - Light background
- `--destructive`: oklch(0.577 0.245 27.325) - Red for errors
- `--border`: oklch(0.922 0 0) - Border color
- Dark mode variants provided

### Button Variants
New button variant added:
```typescript
variant: "cta"  // Call-to-action (amber-500) - use for primary seller actions
```

### Color Rules
1. Use design tokens (primary, secondary, muted, etc.) when possible
2. Semantic colors (success=green, warning=yellow, error=red) are acceptable for status indicators
3. Avoid hardcoded hex colors - use Tailwind classes
4. Always provide dark mode variants for custom colors

---

## 3. Form Components & Validation

### New Form Components
Created reusable, styled form components:
- `<Input />` - Text inputs with validation styling
- `<Select />` - Select dropdowns
- `<Textarea />` - Multi-line text input
- `<Label />` - Form labels with required indicator
- `<FormField />` - Wrapper component with error handling
- `<FormError />` - Error message display

### Validation Schema
Use Zod for runtime validation in `lib/validation.ts`:
```typescript
import { productSchema } from '@/lib/validation'

const result = await productSchema.parseAsync(formData)
if (!result.success) {
  // Handle errors
}
```

### Form Best Practices
```typescript
// ✅ Good: Use FormField with Input
<FormField label="Product Name" error={errors.name}>
  <Input
    value={formData.name}
    onChange={(e) => handleChange('name', e.target.value)}
    placeholder="Enter product name"
  />
</FormField>

// ❌ Bad: Unstyled HTML elements
<input value={formData.name} />
```

---

## 4. Image Optimization

### Configuration
Next.js image optimization is now **enabled**:
- Remote patterns configured for Supabase URLs
- Modern formats: WebP and AVIF with JPEG fallback
- Device-aware sizing (640px - 3840px)

### Usage
```typescript
import Image from 'next/image'

// ✅ Good: Use Next.js Image component
<Image
  src={imageUrl}
  alt="Product image"
  width={400}
  height={400}
  className="object-cover"
/>

// ❌ Bad: HTML img tag
<img src={imageUrl} />
```

---

## 5. Loading States & Skeletons

### Skeleton Components
Pre-built skeletons for common layouts in `components/skeletons.tsx`:
- `<ProductCardSkeleton />`
- `<ProductDetailSkeleton />`
- `<TechnicianCardSkeleton />`
- `<FormSkeleton />`

### Usage
```typescript
'use client'

import { useState, useEffect } from 'react'
import { ProductCardGridSkeleton } from '@/components/skeletons'

export function ProductList() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProducts().then(data => {
      setProducts(data)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) return <ProductCardGridSkeleton />
  
  return <div className="grid gap-6">{/* ... */}</div>
}
```

---

## 6. Error Handling

### Error Handler Utilities
New utilities in `lib/error-handler.ts`:
- `AppError` class for typed errors
- `ERROR_MESSAGES` constant for user-friendly messages
- `getErrorMessage()` - Convert errors to user messages
- `fetchWithErrorHandling()` - API calls with built-in error handling

### Usage
```typescript
import { getErrorMessage, fetchWithErrorHandling } from '@/lib/error-handler'

// Form error handling
try {
  await handleSubmit(formData)
} catch (error) {
  setError(getErrorMessage(error))
}

// API calls
const data = await fetchWithErrorHandling<Product[]>('/api/products')
```

---

## 7. Client vs Server Components

### Guidelines
- Use `'use client'` for:
  - Interactive forms (login, signup, post-ad)
  - Client-side filtering and search
  - State-dependent UI
  - Event handlers

- Use Server Components (default) for:
  - Product listing and detail pages
  - Data fetching (faster, more secure)
  - Static content
  - SEO-critical pages

### Example: Hybrid Approach
```typescript
// ✅ app/products/page.tsx (Server)
async function ProductsPage() {
  const products = await getProducts()
  return <ProductsClient initialProducts={products} />
}

// ✅ components/products-client.tsx (Client)
'use client'
export function ProductsClient({ initialProducts }: Props) {
  const [filtered, setFiltered] = useState(initialProducts)
  // Filtering logic...
}
```

---

## 8. Component Structure

### File Organization
```
components/
├── ui/                      # Reusable primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── form-field.tsx
│   └── ...
├── product/                 # Feature components
│   ├── product-card.tsx
│   ├── product-gallery.tsx
│   └── ...
├── providers/               # Context providers
│   └── auth-provider.tsx
└── skeletons.tsx           # Loading states

app/
├── (routes)/               # Route groups
│   ├── products/
│   ├── dashboard/
│   └── ...
└── layout.tsx              # Root layout
```

### Component Naming
- Use PascalCase for components: `ProductCard`, `TrustSignals`
- Use kebab-case for files: `product-card.tsx`, `trust-signals.tsx`
- Use UPPERCASE for constants: `CATEGORIES`, `CITIES`

---

## 9. Performance Optimization

### Best Practices
1. **Code Splitting**: Use dynamic imports for large components
   ```typescript
   const HeavyComponent = dynamic(() => import('./heavy'), { loading: () => <Skeleton /> })
   ```

2. **Memoization**: Wrap expensive components
   ```typescript
   const MemoProductList = memo(ProductList)
   ```

3. **Image Optimization**: Always use Next.js Image component
4. **Bundle Analysis**: Monitor bundle size with `next/bundle-analyzer`

---

## 10. Accessibility

### Requirements
- All interactive elements must be keyboard accessible
- Use Radix UI components (built-in ARIA support)
- Provide alt text for all images
- Ensure color contrast meets WCAG AA standard
- Test with screen readers

### Checklist
- [ ] All form inputs have associated `<Label>`
- [ ] All links have descriptive text
- [ ] Images have meaningful alt text
- [ ] Color is not the only way to convey information
- [ ] Focus ring is visible on all interactive elements

---

## 11. Git Workflow

### Branch Naming
- `feat/component-name` - New features
- `fix/issue-description` - Bug fixes
- `refactor/what-changed` - Code improvements
- `perf/optimization-name` - Performance improvements

### Commit Messages
```
feat: Add product gallery component with Embla carousel
fix: Correct color token usage in trust-signals component
refactor: Extract form validation logic to lib/validation.ts
perf: Enable Next.js image optimization
```

---

## 12. Testing Recommendations

### Unit Tests (Vitest)
```typescript
// components/__tests__/button.test.ts
import { render, screen } from '@testing-library/react'
import { Button } from '../button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button')).toHaveTextContent('Click me')
})
```

### E2E Tests (Playwright)
```typescript
// tests/auth.spec.ts
test('user can sign up', async ({ page }) => {
  await page.goto('/signup')
  await page.fill('input[type="email"]', 'user@test.com')
  await page.click('button:has-text("Sign Up")')
  await expect(page).toHaveURL('/dashboard')
})
```

---

## Quick Reference

### Common Commands
```bash
# Development
npm run dev

# Type checking
npm run lint

# Build
npm run build

# Production
npm start
```

### Useful Files
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.mjs` - Next.js configuration
- `lib/validation.ts` - Form validation schemas
- `types/database.types.ts` - Database type definitions

---

## Resources
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Zod Validation](https://zod.dev)
- [Next.js Documentation](https://nextjs.org)
- [Radix UI Primitives](https://radix-ui.com)

---

**Last Updated**: February 2026
**Maintained By**: Medixra Development Team
