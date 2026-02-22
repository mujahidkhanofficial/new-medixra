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
import { getTechnicianProfile, updateTechnicianProfile } from '@/lib/actions/technician'
import { getErrorMessage } from '@/lib/error-handler'
import { toast } from 'sonner'
import { CITIES, SPECIALTIES } from '@/lib/constants'
import { MultiSelectSpecialities } from '@/components/ui/multi-select-specialities'

export default function TechnicianEditPage() {
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
        speciality: '',
        experienceYears: '',
    })

    useEffect(() => {
        if (authLoading || !user?.id) return

        async function loadProfile() {
            try {
                setLoading(true)
                const data = await getTechnicianProfile(user!.id)

                if (!data) {
                    setError('Profile not found')
                    return
                }

                setProfile(data)
                setFormData({
                    fullName: data.full_name || '',
                    phone: data.phone || '',
                    city: data.city || '',
                    speciality: data.speciality || '',
                    experienceYears: data.experience_years || '',
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
            const result = await updateTechnicianProfile({
                fullName: formData.fullName,
                phone: formData.phone,
                city: formData.city,
                speciality: formData.speciality,
                experienceYears: formData.experienceYears,
            })

            if (result.success) {
                toast.success('Profile updated successfully!')
                router.push('/dashboard/technician')
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
                        <Button onClick={() => router.push('/dashboard/technician')} asChild>
                            <Link href="/dashboard/technician">Back to Dashboard</Link>
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
                        <Link href="/dashboard/technician">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Edit Technician Profile</h1>
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

                        {/* Professional Information */}
                        <div className="space-y-6 border-t border-border pt-6">
                            <h2 className="text-lg font-semibold text-foreground">Professional Information</h2>

                            <FormField label="Specialities" error={errors.speciality}>
                                <MultiSelectSpecialities
                                    specialities={SPECIALTIES as any}
                                    selected={(() => {
                                        try {
                                            return formData.speciality ? JSON.parse(formData.speciality) : []
                                        } catch {
                                            return formData.speciality ? formData.speciality.split(',').map(s => s.trim()) : []
                                        }
                                    })()}
                                    onChange={(selected) => handleInputChange({ target: { name: 'speciality', value: JSON.stringify(selected) } } as any)}
                                    disabled={isSubmitting}
                                />
                            </FormField>

                            <FormField label="Years of Experience" error={errors.experienceYears} helpText="e.g., 5, 10+">
                                <Input
                                    type="text"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 5 years"
                                    disabled={isSubmitting}
                                />
                            </FormField>
                        </div>

                        {/* Info Box */}
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4">
                            <p className="text-sm text-blue-900 dark:text-blue-300">
                                <strong>Tip:</strong> Keep your profile up-to-date so customers can find and contact you easily on WhatsApp with their service inquiries.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-between pt-6 border-t border-border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/dashboard/technician')}
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
