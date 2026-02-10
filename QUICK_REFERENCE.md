# Quick Reference - Common Tasks

## Form Creation

### 1. Basic Form with Validation
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { emailSchema, passwordSchema } from '@/lib/validation'
import { getErrorMessage } from '@/lib/error-handler'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setErrors({})
    setIsLoading(true)

    try {
      // Validate
      await emailSchema.parseAsync(email)
      await passwordSchema.parseAsync(password)

      // Submit
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) throw new Error('Login failed')
      
      // Success
      window.location.href = '/dashboard'
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <FormError message={error} />}

      <FormField label="Email" required error={errors.email}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
        />
      </FormField>

      <FormField label="Password" required error={errors.password}>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
```

---

## Image Usage

### Product Image Gallery
```typescript
import Image from 'next/image'

export function ProductImage({ src, alt }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={400}
      className="object-cover rounded-lg"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={false}
    />
  )
}
```

---

## Loading States

### Product List with Skeleton
```typescript
'use client'

import { useState, useEffect } from 'react'
import { ProductCardGridSkeleton } from '@/components/skeletons'

export function ProductList() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (isLoading) return <ProductCardGridSkeleton />

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

---

## Error Handling

### API Call with Error Handling
```typescript
import { fetchWithErrorHandling, getErrorMessage } from '@/lib/error-handler'

async function getProducts() {
  try {
    return await fetchWithErrorHandling<Product[]>('/api/products')
  } catch (error) {
    const message = getErrorMessage(error)
    console.error('Failed to load products:', message)
    throw error
  }
}
```

---

## Button Variants

### Available Button Types
```typescript
import { Button } from '@/components/ui/button'

// Primary action (blue)
<Button>Save</Button>

// Call-to-action (amber) - for selling/posting
<Button variant="cta">SELL</Button>

// Secondary action (gray background)
<Button variant="secondary">Cancel</Button>

// Outlined (border only)
<Button variant="outline">Learn More</Button>

// Ghost (text only)
<Button variant="ghost">Link Text</Button>

// Danger (red)
<Button variant="destructive">Delete</Button>

// Icon only
<Button variant="ghost" size="icon">
  <IconComponent />
</Button>
```

---

## Select / Dropdown

### Basic Select
```typescript
import { Select } from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'

<FormField label="Category" required error={errors.category}>
  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
    <option value="">Select a category</option>
    <option value="imaging">Imaging Equipment</option>
    <option value="monitoring">Monitoring Equipment</option>
  </Select>
</FormField>
```

---

## Textarea

### Multi-line Input
```typescript
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'

<FormField label="Description" required helpText="Describe your product">
  <Textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Enter product description..."
    rows={5}
  />
</FormField>
```

---

## Color Usage

### Using Design Tokens
```typescript
// ✅ Good: Use Tailwind classes with tokens
<div className="bg-primary text-primary-foreground">Primary</div>
<div className="bg-secondary text-secondary-foreground">Secondary</div>
<div className="bg-muted text-muted-foreground">Muted</div>
<div className="border border-border">Border</div>
<div className="text-destructive">Error</div>

// For status colors
<div className="text-green-700 dark:text-green-400">Success</div>
<div className="text-yellow-700 dark:text-yellow-400">Warning</div>
<div className="text-red-700 dark:text-red-400">Error</div>
```

---

## Responsive Layout

### Mobile-First Grid
```typescript
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Single column on mobile, 2 on tablet, 3 on desktop */}
</div>

// Breakpoints
// default    : mobile (< 640px)
// sm (640px) : tablet
// md (768px) : small desktop
// lg (1024px): large desktop
// xl (1280px): very large desktop
```

---

## Dark Mode

### Conditional Dark Mode Classes
```typescript
// ✅ Tailwind dark mode is auto - use dark: prefix
<div className="bg-white dark:bg-black text-black dark:text-white">
  Content
</div>

// Works automatically with system preference or manual toggle
```

---

## Common Errors & Solutions

### Type Error: "Cannot find type X"
```typescript
// ✅ Import from lib/validation or types/database.types.ts
import type { Product } from '@/types/database.types'
```

### Image not optimizing
```typescript
// Check that dimensions are specified
<Image src="..." width={400} height={400} />
// Add to next.config.mjs if third-party domain:
// remotePatterns: [{ protocol: 'https', hostname: 'example.com' }]
```

### Form validation not working
```typescript
// Make sure to use parseAsync for async validation
const result = await emailSchema.parseAsync(value)
// Or safeParse for non-throwing validation
const result = emailSchema.safeParse(value)
```

---

## Useful Commands

```bash
# Type check without building
npx tsc --noEmit

# Build with optimization
npm run build

# Start dev server
npm run dev

# Run linter
npm run lint

# Format code
npx prettier --write .
```

---

## Resources

- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Zod Validation](https://zod.dev)
- [Next.js Image](https://nextjs.org/docs/api-reference/next/image)
- [Radix UI](https://radix-ui.com)

---

Last Updated: February 2026
