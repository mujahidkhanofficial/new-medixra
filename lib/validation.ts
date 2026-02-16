import { z } from 'zod'

// Common validation schemas for reuse across forms

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^[\d\s\-\+\(\)]*$/, 'Invalid phone number format')

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''))

// Product validation
export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  condition: z.enum(['New', 'Used', 'Refurbished']),
  location: z.string().min(2, 'Location is required'),
  images: z.array(z.instanceof(File)).min(1, 'At least one image is required'),
  specialities: z.array(z.string()).optional(),
  brand: z.string().optional(),
  warranty: z.string().optional(),
  model: z.string().optional(),
  priceType: z.enum(['fixed', 'range', 'quote']).default('fixed'),
  currency: z.string().default('PKR'),
  ceCertified: z.boolean().default(false),
  fdaApproved: z.boolean().default(false),
  isoCertified: z.boolean().default(false),
  drapRegistered: z.boolean().default(false),
  otherCertifications: z.string().optional(),
  originCountry: z.string().optional(),
  refurbishmentCountry: z.string().optional(),
  installationSupportCountry: z.string().optional(),
  amcAvailable: z.boolean().default(false),
  sparePartsAvailable: z.boolean().default(false),
  installationIncluded: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
})

// Vendor signup validation
export const vendorSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  city: z.string().min(2, 'City is required'),
  businessType: z.string().min(2, 'Business type is required'),
})

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Signup validation
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: phoneSchema,
  role: z.enum(['user', 'vendor', 'technician']),
})

// Additional validation for vendor-specific signup fields
export const vendorSignupSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  businessType: z.string().min(2, 'Business type is required'),
  phone: phoneSchema.optional(),
  city: z.string().min(2, 'City is required'),
  yearsInBusiness: z.string().optional(),
  description: z.string().optional(),
})

// Technician-specific signup fields
export const technicianSignupSchema = z.object({
  phone: phoneSchema.optional(),
  city: z.string().min(2, 'City is required'),
  specialities: z.array(z.string()).optional(),
  experienceYears: z.string().optional(),
})

export type ProductFormData = z.infer<typeof productSchema>
export type VendorFormData = z.infer<typeof vendorSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
