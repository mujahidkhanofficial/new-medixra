'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { FormError } from '@/components/ui/form-error'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/components/providers/auth-provider'
import { getVendorProfile, updateVendorProfile } from '@/lib/actions/vendor'
import { getErrorMessage } from '@/lib/error-handler'
import { toast } from 'sonner'
import { CITIES } from '@/lib/constants'

export default function VendorEditPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        city: '',
        businessName: '',
        description: '',
    })

    useEffect(() => {
        if (authLoading || !user?.id) return

        const userId = user.id

        async function loadProfile() {
            try {
                setLoading(true)
                const data = await getVendorProfile(userId)

                if (!data) {
                    setError('Profile not found')
                    return
                }

                setProfile(data)
                setFormData({
                    fullName: data.full_name || '',
                    phone: data.phone || '',
                    city: data.city || '',
                    businessName: data.business_name || '',
                    description: data.description || '',
                })
                setError(null)
            } catch (err: any) {
                setError(getErrorMessage(err))
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [user?.id, authLoading])

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
            const result = await updateVendorProfile({
                fullName: formData.fullName,
                phone: formData.phone,
                city: formData.city,
                businessName: formData.businessName,
                description: formData.description,
                whatsappNumber: formData.phone, // Sync WhatsApp with Primary Phone
            })

            if (result.success) {
                toast.success('Profile updated successfully!')
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

    if (error && !profile) {
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
                        <h1 className="text-3xl font-bold text-foreground">Edit Business Profile</h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                        {error && <FormError message={error} />}

                        {/* Personal Information */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>

                            <FormField label="Full Name" required error={errors.fullName}>
                                <Input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Your full name"
                                    disabled={isSubmitting}
                                />
                            </FormField>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Phone Number" error={errors.phone}>
                                    <Input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+92 300 1234567"
                                        disabled={isSubmitting}
                                    />
                                </FormField>

                                <FormField label="City" error={errors.city}>
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
                            </div>
                        </div>

                        {/* Business Information */}
                        <div className="space-y-6 border-t border-border pt-6">
                            <h2 className="text-lg font-semibold text-foreground">Business Information</h2>

                            <FormField label="Business Name" required error={errors.businessName}>
                                <Input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    placeholder="Your company or business name"
                                    disabled={isSubmitting}
                                />
                            </FormField>

                            <FormField label="Business Description" error={errors.description}>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Tell customers about your business, products, and services"
                                    rows={5}
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
