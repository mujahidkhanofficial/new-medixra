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
import { MultiSelectSpecialities } from '@/components/ui/multi-select-specialities'
import { productSchema } from '@/lib/validation'
import { getErrorMessage } from '@/lib/error-handler'
import { createAd, saveAdImages } from '@/lib/actions/ads'
import { deleteProduct } from '@/lib/actions/products'
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
    const { user, profile, loading } = useAuth()

    // Client-side guard: block non-vendors and unapproved vendors
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/login')
                return
            }

            // Allow all authenticated users to post ads (User role acts as individual seller)
            if (profile?.role === 'technician') {
                 // Technicians might be restricted or allowed, but for now let's just block suspended
            }

            if (profile?.status === 'suspended') {
                 router.replace('/account-suspended')
                 return
            }

            if (profile?.approval_status !== 'approved') {
                router.replace('/pending-approval')
                return
            }
        }
    }, [user, profile, loading, router])

    // If still loading or redirecting, show spinner
    if (loading || (user && profile?.role !== 'vendor')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // State
    const [step, setStep] = useState(1)
    const [formLoading, setFormLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Draft ID for organizing uploads
    const [draftId] = useState(() => crypto.randomUUID())

    // Form Data
    const [formData, setFormData] = useState({
        category: '',
        name: '',
        description: '',
        price: '',
        condition: 'Used',
        specialities: [] as string[],
        brand: '',
        warranty: 'No Warranty',
        city: '',
        area: '',
    })

    // Image State
    type ImageState = {
        id: string
        file: File
        preview: string
        status: 'waiting' | 'uploading' | 'complete' | 'error'
        url?: string
        error?: string
    }
    const [images, setImages] = useState<ImageState[]>([])
    const [uploadingId, setUploadingId] = useState<string | null>(null)

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

    // Queue Processor
    useEffect(() => {
        const processQueue = async () => {
            if (uploadingId) return // Busy

            const nextImage = images.find(img => img.status === 'waiting')
            if (!nextImage || !user) return

            setUploadingId(nextImage.id)

            // Mark as uploading
            setImages(prev => prev.map(img =>
                img.id === nextImage.id ? { ...img, status: 'uploading' } : img
            ))

            try {
                const fileExt = nextImage.file.name.split('.').pop() || 'jpg'
                // Sanitize filename
                const sanitizedName = nextImage.file.name.replace(/[^a-zA-Z0-9]/g, '')
                // Use user ID in path for security/policy alignment
                const fileName = `uploads/${user.id}/${Date.now()}_${sanitizedName}.${fileExt}`

                console.log('Starting upload:', fileName)

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(fileName, nextImage.file, {
                        upsert: false,
                        contentType: nextImage.file.type // Explicit content type
                    })

                if (uploadError) throw uploadError

                const { data: publicUrlData } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName)

                console.log('Upload success:', publicUrlData.publicUrl)

                setImages(prev => prev.map(img =>
                    img.id === nextImage.id
                        ? { ...img, status: 'complete', url: publicUrlData.publicUrl }
                        : img
                ))
            } catch (err: any) {
                console.error('Upload failed:', err)
                setImages(prev => prev.map(img =>
                    img.id === nextImage.id
                        ? { ...img, status: 'error', error: err.message || 'Upload failed' }
                        : img
                ))
            } finally {
                setUploadingId(null) // Release lock to process next
            }
        }

        processQueue()
    }, [images, uploadingId, user, supabase])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && user) {
            const newFiles = Array.from(e.target.files)

            const newImages: ImageState[] = newFiles.map(file => ({
                id: Math.random().toString(36).substring(7),
                file,
                preview: URL.createObjectURL(file),
                status: 'waiting'
            }))

            setImages(prev => [...prev, ...newImages])
            // Queue effect will pick them up
        }
    }

    const removeImage = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id))
    }

    // ... imports

    const handleSubmit = async () => {
        if (!user) return

        // Block if any images are still uploading or waiting
        if (images.some(img => img.status === 'waiting' || img.status === 'uploading')) {
            alert('Please wait for all images to finish uploading.')
            return
        }

        setFormLoading(true)
        setError(null)
        setErrors({})

        try {
            const adFormData = new FormData()
            adFormData.append('name', formData.name)
            adFormData.append('description', formData.description)
            adFormData.append('price', formData.price)
            adFormData.append('category', formData.category)
            adFormData.append('condition', formData.condition)
            if (formData.specialities.length > 0) adFormData.append('specialities', JSON.stringify(formData.specialities))
            if (formData.brand) adFormData.append('brand', formData.brand)
            if (formData.warranty) adFormData.append('warranty', formData.warranty)
            adFormData.append('city', formData.city)
            adFormData.append('area', formData.area)

            // Filter out failed uploads and get URLs
            const successUrls = images.filter(img => img.url && !img.error).map(img => img.url)
            adFormData.append('imageUrls', JSON.stringify(successUrls))

            const result = await createAd(null, adFormData)

            if (!result.success) {
                if (result.errors) {
                    setErrors(prev => {
                        const newErrors: Record<string, string> = {}
                        Object.entries(result.errors || {}).forEach(([key, msgs]) => {
                            const errorMessages = msgs as string[]
                            newErrors[key] = errorMessages[0]
                        })
                        return newErrors
                    })
                    throw new Error('Please fix the errors in the form.')
                }
                throw new Error(result.message || 'Failed to create ad.')
            }

            alert('Ad Posted Successfully!')
            router.push('/products')
        } catch (err: any) {
            const errorMessage = getErrorMessage(err)
            setError(errorMessage)
            console.error('Post AD Error:', err)
        } finally {
            setFormLoading(false)
        }
    }

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
                <FormField label="Medical Specialities (Optional)">
                    <MultiSelectSpecialities
                        specialities={SPECIALTIES as any}
                        selected={formData.specialities}
                        onChange={(specialities) => setFormData({ ...formData, specialities })}
                        disabled={formLoading}
                    />
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

            <label className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer w-full">
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

            {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {images.map((img) => (
                        <div key={img.id} className="relative aspect-square bg-muted rounded-lg border border-border overflow-hidden group">
                            <Image
                                src={img.preview}
                                alt="Preview"
                                fill
                                className={`object-cover transition-all duration-500 ${img.status === 'complete' ? 'opacity-100 grayscale-0 brightness-100 blur-0' : 'opacity-50 grayscale brightness-110 blur-[1px]'}`}
                            />
                            {(img.status === 'uploading' || img.status === 'waiting') && (
                                <div className="absolute inset-0 flex items-center justify-center flex-col gap-1">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    <span className="text-[10px] font-medium text-black bg-white/80 px-1 rounded">
                                        {img.status === 'waiting' ? 'Queue...' : 'Uploading'}
                                    </span>
                                </div>
                            )}
                            {img.error && (
                                <div className="absolute inset-0 flex items-center justify-center bg-red-500/50">
                                    <AlertCircle className="h-6 w-6 text-white" />
                                </div>
                            )}
                            <button
                                onClick={() => removeImage(img.id)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={formLoading}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} disabled={formLoading}>Back</Button>
                <Button onClick={handleNext} disabled={formLoading || images.some(i => i.status === 'waiting' || i.status === 'uploading')}>
                    Next {images.length === 0 && '(Skip)'}
                </Button>
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
                        {formData.specialities.length > 0 && (
                            <div>
                                <span className="text-muted-foreground block text-xs">Specialities</span>
                                <span className="font-medium">{formData.specialities.join(', ')}</span>
                            </div>
                        )}
                        <div>
                            <span className="text-muted-foreground block text-xs">Photos</span>
                            <span className="font-medium">{images.filter(i => i.url).length} attached</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3 border border-blue-100 dark:border-blue-800">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Safe Selling Tip:</strong> Always meet in a safe, public location. Verify the user before handing over equipment.
                </p>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} disabled={formLoading}>Back</Button>
                <Button className="w-full ml-4 bg-primary hover:bg-primary/90" size="lg" onClick={handleSubmit} disabled={formLoading || images.some(i => i.status === 'waiting' || i.status === 'uploading')}>
                    {formLoading ? 'Posting...' : 'Post Ad Now'}
                </Button>
            </div>
        </div>
    )

    // ... (rest of the component render logic)


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
