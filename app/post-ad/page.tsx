'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { FormError } from '@/components/ui/form-error'
import { productSchema } from '@/lib/validation'
import {
    Camera, MapPin, ChevronRight, CheckCircle2,
    Stethoscope, Monitor, Activity, Microscope,
    Scissors, Syringe, Armchair, Truck, AlertCircle, PlusCircle,
    ShieldCheck, Tag, FileText, X
} from 'lucide-react'

import {
    PRODUCT_CATEGORIES,
    CITIES,
    CONDITIONS,
    SPECIALTIES,
    WARRANTIES
} from '@/lib/constants'

// Map categories to icons
const CATEGORY_ICONS: Record<string, any> = {
    'Imaging Equipment': Activity,
    'Monitoring Equipment': Monitor,
    'Surgical Equipment': Scissors,
    'Laboratory Equipment': Microscope,
    'Dental Equipment': Stethoscope,
    'Hospital Furniture': Armchair,
    'Consumables & Accessories': Syringe,
    'Ambulance & Emergency': Truck,
    'Diagnostic Equipment': Stethoscope, // Fallback icon
    'Respiratory Equipment': Activity, // Fallback icon
    'Sterilization Equipment': CheckCircle2, // Fallback icon
    'Physiotherapy Equipment': Activity, // Fallback icon
    'OT Equipment': Scissors, // Fallback icon
    'Cardiology Equipment': Activity, // Fallback icon
    'Gynecology & Infant Care': Stethoscope, // Fallback icon
    'Refurbished & Parts': Monitor, // Fallback icon
    'Other': CheckCircle2
}

export default function PostAdPage() {
    const router = useRouter()
    const supabase = createClient()
    const { user, loading } = useAuth()

    // State
    const [step, setStep] = useState(1)
    const [formLoading, setFormLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Form Data
    const [formData, setFormData] = useState({
        category: '',
        name: '',
        description: '',
        price: '',
        condition: 'Used',
        speciality: '',
        brand: '',
        warranty: 'No Warranty',
        city: '',
        area: '',
        images: [] as File[]
    })

    // Preview URLs for images
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    const handleNext = async () => {
        setError(null)
        setErrors({})

        // Validate current step data
        if (step === 2) {
            if (!formData.name) {
                setErrors({ name: 'Ad title is required' })
                return
            }
            if (!formData.price) {
                setErrors({ price: 'Price is required' })
                return
            }
        } else if (step === 4) {
            if (!formData.city) {
                setErrors({ city: 'City is required' })
                return
            }
        }

        setStep(prev => prev + 1)
    }

    const handleBack = () => {
        setError(null)
        setErrors({})
        setStep(prev => prev - 1)
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFormData(prev => ({ ...prev, images: [...prev.images, ...newFiles] }))

            const newPreviews = newFiles.map(file => URL.createObjectURL(file))
            setImagePreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        if (!user) return
        setFormLoading(true)
        setError(null)
        setErrors({})

        const TIMEOUT = 30000 // 30 seconds timeout for operations
        let timeoutId: NodeJS.Timeout | null = null

        const createTimeout = (message: string) => {
            if (timeoutId) clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                setFormLoading(false)
                setError(`${message} - Please check your connection and try again.`)
            }, TIMEOUT)
        }

        const clearMyTimeout = () => {
            if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null
            }
        }

        try {
            // Step 1: Validate form
            createTimeout('Form validation timed out')
            await productSchema.parseAsync({
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                condition: formData.condition as 'New' | 'Used' | 'Refurbished',
                location: `${formData.area}, ${formData.city}`,
                images: formData.images
            })
            clearMyTimeout()

            // Step 2: Insert Product
            createTimeout('Creating product listing')
            const { data: product, error: productError } = await supabase
                .from('products')
                .insert({
                    vendor_id: user.id,
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    condition: formData.condition as 'New' | 'Used' | 'Refurbished',
                    speciality: formData.speciality,
                    brand: formData.brand,
                    warranty: formData.warranty,
                    city: formData.city,
                    area: formData.area,
                    location: `${formData.area}, ${formData.city}`,
                    status: 'active'
                })
                .select()
                .single()

            if (productError) {
                clearMyTimeout()
                // Check if it's an auth error
                if (productError.message?.includes('auth') || productError.code === 'PGRST') {
                    throw new Error('Authentication failed. Please log in again and try.')
                }
                throw new Error(`Failed to create listing: ${productError.message || 'Unknown error'}`)
            }

            clearMyTimeout()

            // Step 3: Upload Images (if any)
            if (formData.images.length > 0 && product) {
                for (let i = 0; i < formData.images.length; i++) {
                    createTimeout(`Uploading photo ${i + 1} of ${formData.images.length}`)

                    const file = formData.images[i]
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${product.id}/${i}_${Math.random().toString(36).substring(7)}.${fileExt}`

                    // Validate file size (5MB max)
                    if (file.size > 5 * 1024 * 1024) {
                        clearMyTimeout()
                        throw new Error(`Image ${i + 1} is too large (max 5MB)`)
                    }

                    const { error: uploadError } = await supabase.storage
                        .from('products')
                        .upload(fileName, file, { upsert: false })

                    clearMyTimeout()

                    if (uploadError) {
                        // Continue without this image - don't fail the whole upload
                        console.warn(`Failed to upload image ${i + 1}:`, uploadError)
                        continue
                    }

                    const { data: publicUrlData } = supabase.storage
                        .from('products')
                        .getPublicUrl(fileName)

                    const publicUrl = publicUrlData?.publicUrl

                    if (!publicUrl) {
                        console.warn(`Could not get public URL for image ${i + 1}`)
                        continue
                    }

                    // Insert Image Record
                    createTimeout(`Saving photo ${i + 1} of ${formData.images.length}`)
                    const { error: imageError } = await supabase
                        .from('product_images')
                        .insert({
                            product_id: product.id,
                            url: publicUrl,
                            display_order: i
                        })

                    clearMyTimeout()

                    if (imageError) {
                        console.warn(`Failed to save image record ${i + 1}:`, imageError)
                        // Don't fail - image was uploaded even if record insertion failed
                    }
                }
            }

            clearMyTimeout()
            alert('Ad Posted Successfully!')
            router.push('/products')
        } catch (err: any) {
            clearMyTimeout()
            let errorMessage = 'An error occurred'

            // Handle different error types
            if (err instanceof Error) {
                errorMessage = err.message
            } else if (typeof err === 'object' && err?.message) {
                errorMessage = err.message
            } else if (typeof err === 'string') {
                errorMessage = err
            }

            // Check for specific error patterns
            if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
                setError(`Operation took too long: ${errorMessage}`)
            } else if (errorMessage.includes('auth') || errorMessage.includes('jwt')) {
                setError('Your session has expired. Please log in again.')
            } else if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
                setError('Network connection error. Please check your internet and try again.')
            } else {
                setError(errorMessage)
            }

            console.error('Post AD Error:', err)
        } finally {
            clearMyTimeout()
            setFormLoading(false)
        }
    }

    // ... (Steps 1-4 remain mostly same, skipping for brevity in plan but will write full file)

    const renderStep1_Category = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">Choose a Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PRODUCT_CATEGORIES.map((catName) => {
                    const Icon = CATEGORY_ICONS[catName] || CheckCircle2
                    return (
                        <button
                            key={catName}
                            onClick={() => {
                                setFormData({ ...formData, category: catName })
                                handleNext()
                            }}
                            className={`p-4 flex flex-col items-center justify-center gap-3 rounded-xl border transition-all hover:border-primary hover:bg-primary/5
                                ${formData.category === catName ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card'}
                            `}
                        >
                            <Icon className={`h-8 w-8 ${formData.category === catName ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="font-medium text-xs text-center">{catName}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )

    const renderStep2_Details = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold">Basic Details</h2>
            {error && <FormError message={error} />}
            <div className="space-y-4">
                <FormField label="Ad Title" required error={errors.name}>
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={e => {
                            setFormData({ ...formData, name: e.target.value })
                            if (errors.name) setErrors({ ...errors, name: '' })
                        }}
                        placeholder="e.g. Samsung Ultrasound Machine X5"
                        disabled={formLoading}
                    />
                </FormField>
                <div>
                    <label className="block text-sm font-medium mb-2">Condition</label>
                    <div className="flex gap-3">
                        {CONDITIONS.map(c => (
                            <button
                                key={c}
                                onClick={() => setFormData({ ...formData, condition: c })}
                                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                                    ${formData.condition === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}
                                `}
                                disabled={formLoading}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
                <FormField label="Price (₨)" required error={errors.price}>
                    <Input
                        type="number"
                        value={formData.price}
                        onChange={e => {
                            setFormData({ ...formData, price: e.target.value })
                            if (errors.price) setErrors({ ...errors, price: '' })
                        }}
                        placeholder="e.g. 450000"
                        disabled={formLoading}
                    />
                </FormField>
                <FormField label="Description">
                    <Textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe features, accessories included, and history..."
                        rows={4}
                        disabled={formLoading}
                    />
                </FormField>
            </div>
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} disabled={formLoading}>Back</Button>
                <Button onClick={handleNext} disabled={loading || !formData.name || !formData.price}>Next</Button>
            </div>
        </div>
    )

    const renderStep3_Industrial = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold">Industrial Grade Data</h2>
            <p className="text-sm text-muted-foreground">Buyers trust ads with complete technical details.</p>
            {error && <FormError message={error} />}
            <div className="space-y-4">
                <FormField label="Brand / Manufacturer">
                    <Input
                        type="text"
                        value={formData.brand}
                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="e.g. GE, Philips, Siemens, Mindray"
                        disabled={formLoading}
                    />
                </FormField>
                <div>
                    <label className="block text-sm font-medium mb-2">Warranty</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {WARRANTIES.map(w => (
                            <button
                                key={w}
                                onClick={() => setFormData({ ...formData, warranty: w })}
                                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all
                                    ${formData.warranty === w ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}
                                `}
                                disabled={formLoading}
                            >
                                {w}
                            </button>
                        ))}
                    </div>
                </div>
                <FormField label="Medical Speciality (Optional)">
                    <select
                        value={formData.speciality}
                        onChange={e => setFormData({ ...formData, speciality: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none appearance-none text-foreground"
                        disabled={formLoading}
                    >
                        <option value="">Select Speciality</option>
                        {SPECIALTIES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </FormField>
            </div>
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} disabled={formLoading}>Back</Button>
                <Button onClick={handleNext} disabled={formLoading}>Next</Button>
            </div>
        </div>
    )

    const renderStep4_Location = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold">Location</h2>
            {error && <FormError message={error} />}
            <div className="space-y-4">
                <FormField label="City" required error={errors.city}>
                    <select
                        value={formData.city}
                        onChange={e => {
                            setFormData({ ...formData, city: e.target.value })
                            if (errors.city) setErrors({ ...errors, city: '' })
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-foreground"
                        disabled={formLoading}
                    >
                        <option value="">Select City</option>
                        {CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Area / Location">
                    <Input
                        type="text"
                        value={formData.area}
                        onChange={e => setFormData({ ...formData, area: e.target.value })}
                        placeholder="e.g. DHA Phase 6"
                        disabled={formLoading}
                    />
                </FormField>
            </div>
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} disabled={formLoading}>Back</Button>
                <Button onClick={handleNext} disabled={loading || !formData.city}>Next</Button>
            </div>
        </div>
    )

    const renderStep5_Images = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold">Upload Photos</h2>
            <p className="text-sm text-muted-foreground">Ads with actual photos sell 50% faster.</p>
            {error && <FormError message={error} />}

            <label className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer block w-full">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Click to upload or drag and drop</h3>
                <p className="text-xs text-muted-foreground">Max 3MB per image</p>
                <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={formLoading}
                />
            </label>

            {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {imagePreviews.map((url, i) => (
                        <div key={i} className="relative aspect-square bg-muted rounded-lg border border-border overflow-hidden group">
                            <Image src={url} alt="Preview" fill className="object-cover" />
                            <button
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={formLoading}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    {/* Placeholder slots to fill row if needed, optional */}
                </div>
            )}

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} disabled={formLoading}>Back</Button>
                <Button onClick={handleNext} disabled={formLoading}>Next {imagePreviews.length === 0 && '(Skip)'}</Button>
            </div>
        </div>
    )

    const renderStep6_Review = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold">Ready to Post?</h2>
                <p className="text-muted-foreground">Review your ad details below.</p>
            </div>

            {error && <FormError message={error} />}

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-muted/30 border-b border-border">
                    <h3 className="font-semibold text-lg">{formData.name}</h3>
                    <p className="text-primary font-bold text-xl">₨ {parseInt(formData.price || '0').toLocaleString()}</p>
                </div>
                <div className="p-4 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-muted-foreground block text-xs">Category</span>
                            <span className="font-medium">{formData.category}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs">Condition</span>
                            <span className="font-medium">{formData.condition}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs">Brand</span>
                            <span className="font-medium">{formData.brand || '-'}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs">Warranty</span>
                            <span className="font-medium">{formData.warranty}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs">Location</span>
                            <span className="font-medium">{formData.city}, {formData.area}</span>
                        </div>
                        {formData.speciality && (
                            <div>
                                <span className="text-muted-foreground block text-xs">Speciality</span>
                                <span className="font-medium">{formData.speciality}</span>
                            </div>
                        )}
                        <div>
                            <span className="text-muted-foreground block text-xs">Photos</span>
                            <span className="font-medium">{formData.images.length} attached</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3 border border-blue-100 dark:border-blue-800">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Safe Selling Tip:</strong> Always meet in a safe, public location. Verify the buyer before handing over equipment.
                </p>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} disabled={formLoading}>Back</Button>
                <Button className="w-full ml-4 bg-primary hover:bg-primary/90" size="lg" onClick={handleSubmit} disabled={formLoading}>
                    {formLoading ? 'Posting...' : 'Post Ad Now'}
                </Button>
            </div>
        </div>
    )

    // Show loading while auth is being checked
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Loading...</div>
                </div>
                <Footer />
            </div>
        )
    }

    if (!user) {
        // ... (Login prompt remains same)
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navigation />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                            <PlusCircle className="w-10 h-10 text-amber-600" />
                        </div>
                        <h1 className="text-2xl font-bold">Start Selling on Medixra</h1>
                        <p className="text-muted-foreground">Create an account or log in to post unlimited ads for free.</p>
                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/signup">Create Account</Link>
                            </Button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />
            <main className="flex-1 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    {error && <div className="mb-6"><FormError message={error} /></div>}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                            <span>Step {step} of 6</span>
                            <span>{Math.round((step / 6) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300 ease-out"
                                style={{ width: `${(step / 6) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border border-border shadow-sm p-6 md:p-8">
                        {step === 1 && renderStep1_Category()}
                        {step === 2 && renderStep2_Details()}
                        {step === 3 && renderStep3_Industrial()}
                        {step === 4 && renderStep4_Location()}
                        {step === 5 && renderStep5_Images()}
                        {step === 6 && renderStep6_Review()}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
