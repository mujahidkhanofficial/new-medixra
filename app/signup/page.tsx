'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { FormError } from '@/components/ui/form-error'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/components/providers/auth-provider'
import { getErrorMessage } from '@/lib/error-handler'
import { CITIES, SPECIALTIES, BUSINESS_TYPES } from '@/lib/constants'
import { MultiSelectSpecialities } from '@/components/ui/multi-select-specialities'
import { toast } from 'sonner'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const signupWizardSchema = z.object({
    role: z.enum(['user', 'vendor', 'technician']),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    city: z.string().min(1, 'City is required'),
    companyName: z.string().optional(),
    businessType: z.string().optional(),
    customBusinessType: z.string().optional(),
    yearsExperience: z.string().optional(),
    description: z.string().optional(),
    specialities: z.array(z.string()).optional().default([]),
}).superRefine((data, ctx) => {
    // Vendor specific rules
    if (data.role === 'vendor') {
        if (!data.companyName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Company Name is required', path: ['companyName'] })
        if (!data.businessType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Business Type is required', path: ['businessType'] })
        if (data.businessType === 'Other' && !data.customBusinessType) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please specify your business type', path: ['customBusinessType'] })
        }
    }
})

type SignupWizardData = z.infer<typeof signupWizardSchema>

const DRAFT_KEY = 'signup-draft-v2'

export default function SignupPage() {
    const router = useRouter()
    const supabase = createClient()
    const { user, loading } = useAuth()

    const [step, setStep] = useState<number>(1)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [checkingConfirmation, setCheckingConfirmation] = useState(false)

    // Form setup
    const { register, control, handleSubmit, watch, trigger, reset, setValue, formState: { errors } } = useForm<SignupWizardData>({
        resolver: zodResolver(signupWizardSchema),
        defaultValues: {
            role: (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('role') === 'vendor') ? 'vendor' : 'user',
            email: '',
            password: '',
            fullName: '',
            phoneNumber: '',
            city: '',
            companyName: '',
            businessType: '',
            customBusinessType: '',
            yearsExperience: '',
            description: '',
            specialities: [],
        },
        mode: 'onChange'
    })

    const role = watch('role')
    const totalSteps = role === 'user' ? 3 : 4
    const displayStep = (step === 4 && role === 'user') ? 3 : step

    // Local Storage Data persistence
    const currentData = watch()
    useEffect(() => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY)
            if (raw) {
                const parsed = JSON.parse(raw)
                reset(parsed.data)
                if (parsed.step) setStep(parsed.step)
            }
        } catch (err) { /* ignore */ }
    }, [reset])

    useEffect(() => {
        try {
            // Give RHF time to populate default empty values first
            if (currentData.email !== undefined) {
                localStorage.setItem(DRAFT_KEY, JSON.stringify({ data: currentData, step }))
            }
        } catch (err) { /* ignore */ }
    }, [currentData, step])

    const clearDraft = () => {
        try { localStorage.removeItem(DRAFT_KEY) } catch { }
        reset({ role: 'user', email: '', password: '', fullName: '', phoneNumber: '', city: '', companyName: '', businessType: '', customBusinessType: '', yearsExperience: '', description: '', specialities: [] })
        setStep(1)
    }

    useEffect(() => {
        if (!loading && user) router.replace('/dashboard')
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const nextStep = async () => {
        setError(null)

        if (step === 1) {
            setStep(2)
            return
        }

        if (step === 2) {
            // Trigger RHF validations for specific fields in Step 2
            const fieldsToValidate: any[] = ['email', 'password', 'fullName', 'phoneNumber', 'city']

            const isValid = await trigger(fieldsToValidate)
            if (!isValid) {
                setError('Please fix the errors highlighted below.')
                return
            }
            setStep(role === 'user' ? 4 : 3)
            return
        }

        if (step === 3) {
            // Trigger role specific fields
            let isValid = false
            if (role === 'vendor') isValid = await trigger(['companyName', 'businessType', 'customBusinessType', 'yearsExperience', 'description'])
            if (role === 'technician') isValid = await trigger(['specialities', 'yearsExperience'])

            if (!isValid) {
                setError(`Please fix ${role} details highlighted below.`)
                return
            }
            setStep(4)
        }
    }

    const prevStep = () => {
        setError(null)
        if (step === 4 && role === 'user') setStep(2)
        else setStep((s) => Math.max(1, s - 1))
    }

    const onSubmit = async (data: SignupWizardData) => {
        if (step < 4) return

        setIsLoading(true)
        setError(null)

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                        role: data.role,
                        phone: data.phoneNumber,
                        city: data.city,
                        vendor: data.role === 'vendor' ? {
                            company_name: data.companyName,
                            business_type: data.businessType === 'Other' ? data.customBusinessType : data.businessType,
                            city: data.city,
                            years_in_business: data.yearsExperience,
                            phone: data.phoneNumber || null,
                            whatsapp_number: data.phoneNumber || null,
                            description: data.description || null,
                        } : undefined,
                        technician: data.role === 'technician' ? {
                            phone: data.phoneNumber || null,
                            city: data.city || null,
                            speciality: data.specialities && data.specialities.length > 0 ? JSON.stringify(data.specialities) : null,
                            experience_years: data.yearsExperience || null,
                        } : undefined,
                    },
                },
            })

            if (authError) {
                setError(getErrorMessage(authError))
                return
            }

            if (authData.user) {
                clearDraft()
                setSuccess(true)
            }
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
    }

    const handleCheckConfirmation = async () => {
        setCheckingConfirmation(true)
        try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: currentData.email,
                password: currentData.password,
            })

            if (signInError) {
                if (signInError.message.includes('Email not confirmed')) {
                    toast.info('Email not confirmed yet. Please check your inbox.', { id: 'signup-confirm-pending' })
                } else {
                    toast.error(getErrorMessage(signInError))
                }
                return
            }

            if (signInData.user) {
                toast.success('Email confirmed! Logging you in...', { id: 'signup-confirm-success' })
                clearDraft()
                setTimeout(() => router.push('/dashboard'), 1000)
            }
        } catch (err) {
            toast.error(getErrorMessage(err))
        } finally {
            setCheckingConfirmation(false)
        }
    }

    // Intercept Enter key for multi-step navigation instead of form submission
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if ((e.target as HTMLElement).tagName === 'TEXTAREA') return
            if (step < 4) {
                e.preventDefault()
                nextStep()
            }
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navigation />
                <main className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md text-center space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {role === 'user' ? 'Check Your Email' : 'Account Under Review'}
                        </h1>
                        <p className="text-muted-foreground">
                            {role === 'user' ? (
                                <>We've sent a confirmation link to <strong>{currentData.email}</strong>. Please verify your email to continue.</>
                            ) : (
                                <>Welcome to Medixra! Since you signed up as a <strong>{role}</strong>, our admin team will review your application. Please check your email <strong>{currentData.email}</strong> to verify your account first.</>
                            )}
                        </p>

                        <div className="space-y-3">
                            <Button onClick={handleCheckConfirmation} className="w-full" disabled={checkingConfirmation}>
                                {checkingConfirmation ? 'Checking...' : "I've confirmed my email"}
                            </Button>

                            <Button asChild variant="outline" className="w-full">
                                <Link href="/login">Back to Login</Link>
                            </Button>
                        </div>
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
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
                        <p className="mt-2 text-muted-foreground">Join Pakistan's medical equipment marketplace</p>
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                            <span>Step {displayStep} of {totalSteps}</span>
                            <span>{Math.round((displayStep / totalSteps) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300 ease-out"
                                style={{ width: `${(displayStep / totalSteps) * 100}%` }}
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                        {error && <FormError message={error} />}

                        {/* STEP 1 - CHOOSE ROLE */}
                        {step === 1 && (
                            <div>
                                <p className="text-sm font-medium text-foreground mb-2">Choose your role</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button type="button" onClick={() => setValue('role', 'user')} className={`p-4 rounded-lg border text-center transition-all ${role === 'user' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
                                        <span className="font-medium block">Individual</span>
                                        <span className="text-xs text-muted-foreground">Buy & Sell</span>
                                    </button>

                                    <button type="button" onClick={() => setValue('role', 'technician')} className={`p-4 rounded-lg border text-center transition-all ${role === 'technician' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
                                        <span className="font-medium block">Technician</span>
                                        <span className="text-xs text-muted-foreground">Offer Services</span>
                                    </button>

                                    <button type="button" onClick={() => setValue('role', 'vendor')} className={`p-4 rounded-lg border text-center transition-all ${role === 'vendor' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
                                        <span className="font-medium block">Business</span>
                                        <span className="text-xs text-muted-foreground">Vendor Store</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2 - BASIC ACCOUNT INFO */}
                        {step === 2 && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Full Name" required error={errors.fullName?.message}>
                                        <Input type="text" {...register('fullName')} placeholder="John Doe" disabled={isLoading} />
                                    </FormField>

                                    <FormField label="Phone Number" required error={errors.phoneNumber?.message}>
                                        <Input type="tel" {...register('phoneNumber')} placeholder="+92 300 1234567" disabled={isLoading} />
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Email Address" required error={errors.email?.message}>
                                        <Input type="email" {...register('email')} placeholder="you@example.com" disabled={isLoading} />
                                    </FormField>

                                    <FormField label="City" required error={errors.city?.message}>
                                        <Controller
                                            control={control}
                                            name="city"
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                                                    <SelectTrigger><SelectValue placeholder="Select a city" /></SelectTrigger>
                                                    <SelectContent>
                                                        {CITIES.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </FormField>
                                </div>

                                <FormField label="Password" required error={errors.password?.message} helpText="Minimum 8 characters with uppercase, lowercase, and number">
                                    <Input type="password" {...register('password')} placeholder="••••••••" disabled={isLoading} />
                                </FormField>
                            </>
                        )}

                        {/* STEP 3 - VENDOR DETAILS */}
                        {step === 3 && role === 'vendor' && (
                            <div className="space-y-4 pt-2">
                                <h4 className="text-sm font-semibold text-foreground">Business Details</h4>

                                <FormField label="Company Name" required error={errors.companyName?.message}>
                                    <Input type="text" {...register('companyName')} placeholder="Company or business name" disabled={isLoading} />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField label="Business Type" required error={errors.businessType?.message}>
                                        <Controller
                                            control={control}
                                            name="businessType"
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                                                    <SelectTrigger><SelectValue placeholder="Select business type" /></SelectTrigger>
                                                    <SelectContent>
                                                        {BUSINESS_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </FormField>

                                    {watch('businessType') === 'Other' && (
                                        <FormField label="Specify Business Type" required error={errors.customBusinessType?.message}>
                                            <Input type="text" {...register('customBusinessType')} placeholder="Explain your business..." disabled={isLoading} />
                                        </FormField>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField label="Years in Business" error={errors.yearsExperience?.message}>
                                        <Input type="text" {...register('yearsExperience')} placeholder="e.g. 5" disabled={isLoading} />
                                    </FormField>
                                </div>

                                <FormField label="Business Description" error={errors.description?.message}>
                                    <Textarea {...register('description')} placeholder="Tell customers about your business..." rows={3} disabled={isLoading} />
                                </FormField>
                            </div>
                        )}

                        {/* STEP 3 - TECHNICIAN DETAILS */}
                        {step === 3 && role === 'technician' && (
                            <div className="space-y-4 pt-2">
                                <h4 className="text-sm font-semibold text-foreground">Technician Details</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <FormField label="Years Experience" error={errors.yearsExperience?.message}>
                                        <Input type="text" {...register('yearsExperience')} placeholder="e.g. 5" disabled={isLoading} />
                                    </FormField>
                                </div>

                                <FormField label="Specialities" error={errors.specialities?.message as string}>
                                    <Controller control={control} name="specialities" render={({ field }) => (
                                        <MultiSelectSpecialities specialities={SPECIALTIES as any} selected={field.value || []} onChange={field.onChange} disabled={isLoading} />
                                    )} />
                                </FormField>
                            </div>
                        )}

                        {/* STEP 4 - REVIEW */}
                        {step === 4 && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-foreground">Review your information</h4>
                                <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                                    <div><strong>Name:</strong> {currentData.fullName}</div>
                                    <div><strong>Email:</strong> {currentData.email}</div>
                                    <div><strong>Phone:</strong> {currentData.phoneNumber}</div>
                                    <div><strong>City:</strong> {currentData.city}</div>
                                    <div><strong>Role:</strong> {role}</div>
                                    {role === 'vendor' && (
                                        <>
                                            <div><strong>Company:</strong> {currentData.companyName}</div>
                                            <div><strong>Business Type:</strong> {currentData.businessType === 'Other' ? currentData.customBusinessType : currentData.businessType}</div>
                                            <div><strong>Experience:</strong> {currentData.yearsExperience} Years</div>
                                        </>
                                    )}
                                    {role === 'technician' && (
                                        <>
                                            <div><strong>Experience:</strong> {currentData.yearsExperience} Years</div>
                                            <div><strong>Specialities:</strong> {currentData.specialities?.length ? currentData.specialities.join(', ') : 'Not specified'}</div>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-between">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)}>Edit Role</Button>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setStep(2)}>Edit Account</Button>
                                    {role !== 'user' && (
                                        <Button type="button" variant="outline" size="sm" onClick={() => setStep(3)}>Edit Details</Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* RHF forces inputs to be mounted before triggering validation during onSubmit. 
                            Since we use multipage forms, hidden inputs render but are virtually maintained by RHF. */}

                        <div className="flex gap-3 justify-between pt-6">
                            <div className="flex gap-2">
                                {step > 1 ? (
                                    <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading}>Back</Button>
                                ) : (
                                    <Button type="button" variant="outline" onClick={clearDraft}>Clear Draft</Button>
                                )}
                            </div>

                            <div>
                                {step < 4 ? (
                                    <Button type="button" onClick={nextStep} className="bg-primary">Next</Button>
                                ) : (
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Creating account...' : 'Create Account'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    )
}
