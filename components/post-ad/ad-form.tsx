'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { getErrorMessage } from '@/lib/error-handler'
import { createAd, updateAd } from '@/lib/actions/ads'
import { uploadImage } from '@/lib/actions/upload'
import { AdFormData, ImageState } from '@/components/post-ad/types'
import { toast } from 'sonner'

// Step Components
import { Step1Category } from '@/components/post-ad/steps/step1-category'
import { Step2Details } from '@/components/post-ad/steps/step2-details'
import { Step3Industrial } from '@/components/post-ad/steps/step3-industrial'
import { Step4Regulatory } from '@/components/post-ad/steps/step4-regulatory'
import { Step5Origin } from '@/components/post-ad/steps/step5-origin'
import { Step6Location } from '@/components/post-ad/steps/step6-location'
import { Step7Images } from '@/components/post-ad/steps/step7-images'
import { Step8Review } from '@/components/post-ad/steps/step8-review'

const MAX_IMAGES = 8
const COMPRESSION_TIMEOUT_MS = 10_000 // 10 seconds

async function compressImage(file: File, maxDimension = 1920, quality = 0.8): Promise<File> {
    if (file.size < 500 * 1024) {
        return file
    }

    return new Promise((resolve) => {
        // Fallback timeout to return original file if compression hangs
        const timer = setTimeout(() => {
            console.warn('Image compression timed out, using original file')
            resolve(file)
        }, COMPRESSION_TIMEOUT_MS)

        const img = new window.Image()
        const url = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(url)
            let { width, height } = img

            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round((height / width) * maxDimension)
                    width = maxDimension
                } else {
                    width = Math.round((width / height) * maxDimension)
                    height = maxDimension
                }
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                clearTimeout(timer)
                resolve(file)
                return
            }

            ctx.drawImage(img, 0, 0, width, height)
            canvas.toBlob(
                (blob) => {
                    clearTimeout(timer)
                    if (!blob) {
                        resolve(file)
                        return
                    }
                    const compressed = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    })
                    resolve(compressed.size < file.size ? compressed : file)
                },
                'image/jpeg',
                quality
            )
        }

        img.onerror = (err) => {
            clearTimeout(timer)
            URL.revokeObjectURL(url)
            console.warn('Image load error during compression', err)
            resolve(file)
        }
        img.src = url
    })
}

interface AdFormProps {
    initialData?: AdFormData & { id?: string; imageUrls?: string[] }
}

export function AdForm({ initialData }: AdFormProps) {
    const router = useRouter()
    const { user, profile, loading } = useAuth()
    const isEditMode = !!initialData?.id

    // Client-side guard
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/login')
                return
            }
            if (profile?.status === 'suspended') {
                router.replace('/account-suspended')
                return
            }
            if ((profile?.role === 'vendor' || profile?.role === 'technician') && profile?.approval_status !== 'approved') {
                router.replace('/pending-approval')
                return
            }
        }
    }, [user, profile, loading, router])

    if (loading) {
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

    // Form Data
    const [formData, setFormData] = useState<AdFormData>(initialData || {
        category: '',
        name: '',
        model: '',
        description: '',
        price: '',
        priceType: 'fixed',
        currency: 'PKR',
        condition: 'Used',
        specialities: [],
        tags: [],
        brand: '',
        warranty: 'No Warranty',
        
        // Regulatory
        ceCertified: false,
        fdaApproved: false,
        isoCertified: false,
        drapRegistered: false,
        otherCertifications: '',
        
        // Origin & Service
        originCountry: '',
        refurbishmentCountry: '',
        installationSupportCountry: '',
        amcAvailable: false,
        sparePartsAvailable: false,
        installationIncluded: false,
        
        city: '',
        area: '',
    })

    // Image State
    const [images, setImages] = useState<ImageState[]>(() => {
        if (initialData?.imageUrls) {
            return initialData.imageUrls.map(url => ({
                id: Math.random().toString(36).substring(7),
                file: new File([], "existing-image"), 
                preview: url, 
                status: 'complete',
                url: url
            }))
        }
        return []
    })

    const uploadLockRef = useRef(false)
    const submitLockRef = useRef(false)
    const imagesRef = useRef(images)
    imagesRef.current = images

    const updateFormData = (data: Partial<AdFormData>) => {
        setFormData(prev => ({ ...prev, ...data }))
        if (Object.keys(errors).length > 0) {
            const newErrors = { ...errors }
            Object.keys(data).forEach(key => delete newErrors[key])
            setErrors(newErrors)
        }
    }

    const handleNext = async () => {
        setError(null)
        setErrors({})

        // Validate current step
        if (step === 2) {
            const stepErrors: Record<string, string> = {}
            if (!formData.name) stepErrors.name = 'Product name is required'
            else if (formData.name.length < 3) stepErrors.name = 'Product name must be at least 3 characters'
            
            if (!formData.description || formData.description.length < 10) stepErrors.description = 'Description must be at least 10 characters'
            
            if (formData.priceType !== 'quote' && !formData.price) stepErrors.price = 'Price is required'
            
            if (Object.keys(stepErrors).length > 0) {
                setErrors(stepErrors)
                return
            }
        } else if (step === 6) { 
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

    // Queue Processor for Images
    const processUploadQueue = useCallback(async () => {
        if (uploadLockRef.current) return

        const currentImages = imagesRef.current
        const nextImage = currentImages.find(img => img.status === 'waiting')
        if (!nextImage) return

        if (!user) {
            setImages(prev => prev.map(img =>
                img.id === nextImage.id
                    ? { ...img, status: 'error', error: 'Login session missing. Please login again.' }
                    : img
            ))
            return
        }

        uploadLockRef.current = true
        console.log('🚀 processUploadQueue: Starting upload for:', nextImage.file.name)

        try {
            setImages(prev => prev.map(img =>
                img.id === nextImage.id ? { ...img, status: 'uploading' } : img
            ))

            console.log('📸 Compressing image...')
            const compressedFile = await compressImage(nextImage.file)
            console.log(`✅ Compression done. Size: ${Math.round(compressedFile.size / 1024)}KB`)

            // Use Server Action for Upload
            const formData = new FormData()
            formData.append('file', compressedFile)
            formData.append('bucket', 'products') 

            console.log('☁️ Uploading via Server Action...')
            const result = await uploadImage(formData)

            if (!result.success || !result.url) {
                throw new Error(result.error || 'Upload failed')
            }

            console.log('✅ Upload success:', result.url)

            uploadLockRef.current = false

            setImages(prev => prev.map(img =>
                img.id === nextImage.id
                    ? { ...img, status: 'complete', url: result.url }
                    : img
            ))

        } catch (err: any) {
            console.error('❌ Upload process failed:', err)
            uploadLockRef.current = false
            const message = err?.message || 'Upload failed. Please retry.'
            setImages(prev => prev.map(img =>
                img.id === nextImage.id
                    ? { ...img, status: 'error', error: message }
                    : img
            ))
        }
    }, [user]) // Removed supabase dependency as we use server action

    // Trigger queue processing when images change
    useEffect(() => {
        if (imagesRef.current.some(img => img.status === 'waiting')) {
            processUploadQueue()
        }
    }, [images, processUploadQueue])

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            imagesRef.current.forEach(img => {
                if (img.preview && !img.url) URL.revokeObjectURL(img.preview)
            })
        }
    }, [])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            if (!user) {
                toast.error('Please log in to upload images.')
                return
            }

            const currentCount = images.length
            const newFiles = Array.from(e.target.files)

            if (currentCount + newFiles.length > MAX_IMAGES) {
                toast.error(`Maximum ${MAX_IMAGES} images allowed.`)
                e.target.value = ''
                return
            }

            const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
            const MAX_FILE_SIZE = 10 * 1024 * 1024

            const validFiles = newFiles.filter(file => {
                if (!ALLOWED_TYPES.includes(file.type)) {
                    toast.error(`${file.name}: Only JPG, PNG, and WebP are allowed.`)
                    return false
                }
                if (file.size > MAX_FILE_SIZE) {
                    toast.error(`${file.name} is too large.`)
                    return false
                }
                return true
            })

            const newImages: ImageState[] = validFiles.map(file => ({
                id: Math.random().toString(36).substring(7),
                file,
                preview: URL.createObjectURL(file), // Optimistic preview
                status: 'waiting'
            }))

            setImages(prev => [...prev, ...newImages])
            e.target.value = ''
        }
    }

    const removeImage = (id: string) => {
        setImages(prev => {
            const img = prev.find(i => i.id === id)
            if (img?.preview && !img.url) URL.revokeObjectURL(img.preview)
            return prev.filter(i => i.id !== id)
        })
    }

    const retryImage = (id: string) => {
        setImages(prev => prev.map(img =>
            img.id === id ? { ...img, status: 'waiting' as const, error: undefined } : img
        ))
    }

    const handleSubmit = async () => {
        if (!user) return
        if (submitLockRef.current) return

        if (images.some(img => img.status === 'waiting' || img.status === 'uploading')) {
            toast.warning('Please wait for all images to finish uploading.')
            return
        }

        const validationErrors: Record<string, string> = {}
        if (!formData.category) validationErrors.category = 'Category is required'
        if (!formData.name || formData.name.length < 3) validationErrors.name = 'Product name must be at least 3 characters'
        if (!formData.description || formData.description.length < 10) validationErrors.description = 'Description must be at least 10 characters'
        if (formData.priceType !== 'quote' && (!formData.price || Number(formData.price) <= 0)) validationErrors.price = 'Price is required'
        if (!formData.city) validationErrors.city = 'City is required'
        if (!images.some(img => img.status === 'complete')) validationErrors.images = 'At least one image is required'
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            setError('Please fix the highlighted errors before submitting.')
            return
        }

        submitLockRef.current = true
        setFormLoading(true)
        setError(null)
        setErrors({})

        try {
            const adFormData = new FormData()
            // ... (rest of form data appending is same)
            adFormData.append('name', formData.name)
            adFormData.append('description', formData.description)
            adFormData.append('price', formData.price)
            adFormData.append('category', formData.category)
            adFormData.append('condition', formData.condition)
            if (formData.specialities.length > 0) adFormData.append('specialities', JSON.stringify(formData.specialities))
            if (formData.tags.length > 0) adFormData.append('tags', JSON.stringify(formData.tags))
            if (formData.brand) adFormData.append('brand', formData.brand)
            if (formData.warranty) adFormData.append('warranty', formData.warranty)
            adFormData.append('city', formData.city)
            adFormData.append('area', formData.area)

            if (formData.model) adFormData.append('model', formData.model)
            adFormData.append('priceType', formData.priceType)
            adFormData.append('currency', formData.currency)
            adFormData.append('ceCertified', String(formData.ceCertified))
            adFormData.append('fdaApproved', String(formData.fdaApproved))
            adFormData.append('isoCertified', String(formData.isoCertified))
            adFormData.append('drapRegistered', String(formData.drapRegistered))
            if (formData.otherCertifications) adFormData.append('otherCertifications', formData.otherCertifications)
            if (formData.originCountry) adFormData.append('originCountry', formData.originCountry)
            if (formData.refurbishmentCountry) adFormData.append('refurbishmentCountry', formData.refurbishmentCountry)
            if (formData.installationSupportCountry) adFormData.append('installationSupportCountry', formData.installationSupportCountry)
            adFormData.append('amcAvailable', String(formData.amcAvailable))
            adFormData.append('sparePartsAvailable', String(formData.sparePartsAvailable))
            adFormData.append('installationIncluded', String(formData.installationIncluded))

            const successUrls = images.filter(img => img.url && !img.error).map(img => img.url)
            adFormData.append('imageUrls', JSON.stringify(successUrls))

            let result;
            if (isEditMode && initialData?.id) {
                result = await updateAd(initialData.id, null, adFormData)
            } else {
                result = await createAd(null, adFormData)
            }

            if (!result.success) {
                if (result.errors) {
                    const newErrors: Record<string, string> = {}
                    const errorMessages: string[] = []
                    Object.entries(result.errors || {}).forEach(([key, msgs]) => {
                        const messages = msgs as string[]
                        newErrors[key] = messages[0]
                        errorMessages.push(`${key}: ${messages[0]}`)
                    })
                    setErrors(newErrors)
                    toast.error(errorMessages.join(', '))
                    throw new Error(result.message || 'Please fix the errors in the form.')
                }
                throw new Error(result.message || (isEditMode ? 'Failed to update ad.' : 'Failed to create ad.'))
            }

            toast.success(isEditMode ? 'Ad updated successfully! 🎉' : 'Ad posted successfully! 🎉')
            router.push('/dashboard/user') 
        } catch (err: any) {
            const errorMessage = getErrorMessage(err)
            setError(errorMessage)
            console.error('Post/Update AD Error:', err)
        } finally {
            setFormLoading(false)
            submitLockRef.current = false
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />
            <main className="flex-1 py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                            <span>Step {step} of 8</span>
                            <span>{Math.round((step / 8) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 8) * 100}%` }} />
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border shadow-sm p-6 md:p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Ad' : 'Post New Ad'}</h1>
                        </div>
                    
                        {step === 1 && (
                            <Step1Category
                                formData={formData}
                                updateFormData={updateFormData}
                                onNext={handleNext}
                            />
                        )}
                        {step === 2 && (
                            <Step2Details
                                formData={formData}
                                updateFormData={updateFormData}
                                onNext={handleNext}
                                onBack={handleBack}
                                errors={errors}
                                formLoading={formLoading}
                                error={error}
                            />
                        )}
                        {step === 3 && (
                            <Step3Industrial
                                formData={formData}
                                updateFormData={updateFormData}
                                onNext={handleNext}
                                onBack={handleBack}
                                formLoading={formLoading}
                                error={error}
                            />
                        )}
                        {step === 4 && (
                            <Step4Regulatory
                                formData={formData}
                                updateFormData={updateFormData}
                                onNext={handleNext}
                                onBack={handleBack}
                                formLoading={formLoading}
                            />
                        )}
                        {step === 5 && (
                            <Step5Origin
                                formData={formData}
                                updateFormData={updateFormData}
                                onNext={handleNext}
                                onBack={handleBack}
                                formLoading={formLoading}
                            />
                        )}
                        {step === 6 && (
                            <Step6Location
                                formData={formData}
                                updateFormData={updateFormData}
                                onNext={handleNext}
                                onBack={handleBack}
                                errors={errors}
                                formLoading={formLoading}
                            />
                        )}
                        {step === 7 && (
                            <Step7Images
                                images={images}
                                onImageUpload={handleImageUpload}
                                onRemoveImage={removeImage}
                                onRetryImage={retryImage}
                                onNext={handleNext}
                                onBack={handleBack}
                                formLoading={formLoading}
                            />
                        )}
                        {step === 8 && (
                            <Step8Review
                                formData={formData}
                                images={images}
                                onSubmit={handleSubmit}
                                onBack={handleBack}
                                formLoading={formLoading}
                            />
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
