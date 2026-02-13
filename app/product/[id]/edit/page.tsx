'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { FormError } from '@/components/ui/form-error'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/components/providers/auth-provider'
import { getProductById } from '@/lib/actions/products'
import { updateProduct } from '@/lib/actions/products'
import { getErrorMessage } from '@/lib/error-handler'
import { toast } from 'sonner'
import {
    PRODUCT_CATEGORIES,
    CITIES,
    CONDITIONS,
    WARRANTIES
} from '@/lib/constants'

export default function ProductEditPage() {
    const router = useRouter()
    const params = useParams()
    const { user, loading: authLoading } = useAuth()
    const productId = params.id as string

    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        condition: 'Used',
        speciality: '',
        brand: '',
        warranty: 'No Warranty',
        city: '',
        location: '',
        area: '',
    })

    useEffect(() => {
        if (authLoading || !user?.id) return

        async function loadProduct() {
            try {
                setLoading(true)
                const data = await getProductById(productId)

                if (!data) {
                    setError('Product not found')
                    return
                }

                if (data.vendor_id !== user!.id) {
                    setError('You do not have permission to edit this product')
                    return
                }

                setProduct(data)
                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    price: data.price?.toString() || '',
                    category: data.category || '',
                    condition: data.condition || 'Used',
                    speciality: data.speciality || '',
                    brand: data.brand || '',
                    warranty: data.warranty || 'No Warranty',
                    city: data.city || '',
                    location: data.location || '',
                    area: data.area || '',
                })
                setError(null)
            } catch (err: any) {
                setError(getErrorMessage(err))
            } finally {
                setLoading(false)
            }
        }

        loadProduct()
    }, [productId, user?.id, authLoading])

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setErrors({})

        try {
            const result = await updateProduct({
                productId,
                name: formData.name,
                description: formData.description,
                price: formData.price,
                category: formData.category,
                condition: formData.condition as any,
                speciality: formData.speciality,
                brand: formData.brand,
                warranty: formData.warranty,
                city: formData.city,
                location: formData.location,
                area: formData.area,
            })

            if (result.success) {
                toast.success('Product updated successfully!')
                router.push('/dashboard/vendor')
            } else if (result.error) {
                setError(result.error)
            }
        } catch (err: any) {
            setError(getErrorMessage(err))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navigation />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </main>
                <Footer />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navigation />
                <main className="flex-1 flex items-center justify-center px-4">
                    <div className="max-w-md text-center space-y-4">
                        <h1 className="text-2xl font-bold text-foreground">{error}</h1>
                        <Button onClick={() => router.push('/dashboard/vendor')} asChild>
                            <Link href="/dashboard/vendor">Back to Dashboard</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/dashboard/vendor">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                        {error && <FormError message={error} />}

                        {/* Basic Information */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>

                            <FormField label="Product Name" required error={errors.name}>
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter product name"
                                    disabled={isSubmitting}
                                />
                            </FormField>

                            <FormField label="Description" required error={errors.description}>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your product in detail"
                                    rows={5}
                                    disabled={isSubmitting}
                                />
                            </FormField>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Price (PKR)" required error={errors.price}>
                                    <Input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        disabled={isSubmitting}
                                    />
                                </FormField>

                                <FormField label="Category" required error={errors.category}>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full rounded border border-border bg-background px-4 py-2 text-foreground"
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Select category</option>
                                        {PRODUCT_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-6 border-t border-border pt-6">
                            <h2 className="text-lg font-semibold text-foreground">Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Condition" error={errors.condition}>
                                    <select
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleInputChange}
                                        className="w-full rounded border border-border bg-background px-4 py-2 text-foreground"
                                        disabled={isSubmitting}
                                    >
                                        {CONDITIONS.map((cond) => (
                                            <option key={cond} value={cond}>
                                                {cond}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Brand" error={errors.brand}>
                                    <Input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        placeholder="Brand (optional)"
                                        disabled={isSubmitting}
                                    />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Speciality" error={errors.speciality}>
                                    <Input
                                        type="text"
                                        name="speciality"
                                        value={formData.speciality}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Cardiology, Imaging"
                                        disabled={isSubmitting}
                                    />
                                </FormField>

                                <FormField label="Warranty" error={errors.warranty}>
                                    <select
                                        name="warranty"
                                        value={formData.warranty}
                                        onChange={handleInputChange}
                                        className="w-full rounded border border-border bg-background px-4 py-2 text-foreground"
                                        disabled={isSubmitting}
                                    >
                                        {WARRANTIES.map((war) => (
                                            <option key={war} value={war}>
                                                {war}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-6 border-t border-border pt-6">
                            <h2 className="text-lg font-semibold text-foreground">Location</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="City" required error={errors.city}>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full rounded border border-border bg-background px-4 py-2 text-foreground"
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Select city</option>
                                        {CITIES.map((city) => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Area/Location" error={errors.location}>
                                    <Input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="Specific area or location"
                                        disabled={isSubmitting}
                                    />
                                </FormField>
                            </div>

                            <FormField label="Address" error={errors.area}>
                                <Input
                                    type="text"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    placeholder="Detailed address (optional)"
                                    disabled={isSubmitting}
                                />
                            </FormField>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-between pt-6 border-t border-border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/dashboard/vendor')}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    )
}
