'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { FormError } from '@/components/ui/form-error'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/components/providers/auth-provider'
import { signupSchema, vendorSignupSchema, technicianSignupSchema } from '@/lib/validation'
import { getErrorMessage } from '@/lib/error-handler'
import { CITIES, SPECIALTIES } from '@/lib/constants'
import { MultiSelectSpecialities } from '@/components/ui/multi-select-specialities'
import { Toaster, toast } from 'sonner'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [role, setRole] = useState<'user' | 'vendor' | 'technician'>((typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('role') === 'vendor') ? 'vendor' : 'user')

    // User city (for all roles)
    const [userCity, setUserCity] = useState('')

    // Vendor fields
    const [companyName, setCompanyName] = useState('')
    const [businessType, setBusinessType] = useState('')
    const [vendorCity, setVendorCity] = useState('')
    const [yearsInBusiness, setYearsInBusiness] = useState('')

    // Technician fields
    const [techPhone, setTechPhone] = useState('')
    const [techCity, setTechCity] = useState('')
    const [specialities, setSpecialities] = useState<string[]>([])
    const [experienceYears, setExperienceYears] = useState('')

    const [errors, setErrors] = useState<Record<string, string | string[]>>({})
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [step, setStep] = useState<number>(1) // 1: role, 2: account, 3: details, 4: review
    const [checkingConfirmation, setCheckingConfirmation] = useState(false)

    const totalSteps = role === 'user' ? 3 : 4
    const displayStep = (step === 4 && role === 'user') ? 3 : step

    const DRAFT_KEY = 'signup-draft-v1'

    const router = useRouter()
    const supabase = createClient()
    const { user, loading } = useAuth()

    // Load draft from localStorage on mount
    useEffect(() => {
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem(DRAFT_KEY) : null
            if (raw) {
                const d = JSON.parse(raw)
                if (d.email) setEmail(d.email)
                if (d.fullName) setFullName(d.fullName)
                if (d.role) setRole(d.role)
                if (d.userCity) setUserCity(d.userCity)
                if (d.companyName) setCompanyName(d.companyName)
                if (d.businessType) setBusinessType(d.businessType)
                if (d.vendorCity) setVendorCity(d.vendorCity)
                if (d.yearsInBusiness) setYearsInBusiness(d.yearsInBusiness)
                if (d.techPhone) setTechPhone(d.techPhone)
                if (d.techCity) setTechCity(d.techCity)
                if (d.specialities) setSpecialities(d.specialities)
                if (d.experienceYears) setExperienceYears(d.experienceYears)
                if (d.phoneNumber) setPhoneNumber(d.phoneNumber)
                if (d.step) setStep(d.step)
            }
        } catch (err) {
            console.warn('Failed to load signup draft', err)
        }
    }, [])

    // Persist draft on change
    useEffect(() => {
        try {
            const payload = JSON.stringify({
                email,
                fullName,
                phoneNumber,
                userCity,
                role,
                companyName,
                businessType,
                vendorCity,
                yearsInBusiness,
                techPhone,
                techCity,
                specialities,
                experienceYears,
                step,
            })
            localStorage.setItem(DRAFT_KEY, payload)
        } catch (err) {
            /* ignore */
        }
    }, [email, fullName, phoneNumber, userCity, role, companyName, businessType, vendorCity, yearsInBusiness, techPhone, techCity, specialities, experienceYears, step])

    const clearDraft = () => {
        try { localStorage.removeItem(DRAFT_KEY) } catch { }
    }

    useEffect(() => {
        if (!loading && user) {
            router.replace('/dashboard')
        }
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
        setErrors({})

        if (step === 1) {
            setStep(2)
            return
        }

        if (step === 2) {
            // validate account info before proceeding
            try {
                await signupSchema.parseAsync({ email, password, fullName, phoneNumber, role })
                if (role === 'user') {
                    setStep(4) // Skip details
                } else {
                    setStep(3)
                }
            } catch (e: any) {
                if (e?.flatten) {
                    setErrors(e.flatten().fieldErrors as any)
                    setError('Please fix the errors')
                } else {
                    setError(getErrorMessage(e))
                }
            }
            return
        }

        if (step === 3) {
            // validate role-specific details before review
            if (role === 'vendor') {
                const vendorResult = vendorSignupSchema.safeParse({ companyName, businessType, city: vendorCity })
                if (!vendorResult.success) {
                    setErrors(vendorResult.error.flatten().fieldErrors as any)
                    setError('Please fix vendor details')
                    return
                }
            }
            if (role === 'technician') {
                const techResult = technicianSignupSchema.safeParse({ city: techCity })
                if (!techResult.success) {
                    setErrors(techResult.error.flatten().fieldErrors as any)
                    setError('Please fix technician details')
                    return
                }
            }
            setStep(4)
            return
        }
    }

    const prevStep = () => {
        setError(null)
        setErrors({})
        if (step === 4 && role === 'user') {
            setStep(2)
        } else {
            setStep((s) => Math.max(1, s - 1))
        }
    }

    const handleSignup = async () => {
        setIsLoading(true)
        setError(null)
        setErrors({})

        try {
            // Re-validate everything before submit
            await signupSchema.parseAsync({ email, password, fullName, phoneNumber, role })

            if (role === 'vendor') {
                const vendorResult = vendorSignupSchema.safeParse({
                    companyName,
                    businessType,
                    phone: techPhone || undefined,
                    city: vendorCity,
                    yearsInBusiness,
                    description: undefined,
                })
                if (!vendorResult.success) {
                    setErrors(vendorResult.error.flatten().fieldErrors as any)
                    setError('Please fix vendor details')
                    setIsLoading(false)
                    return
                }
            }

            if (role === 'technician') {
                const techResult = technicianSignupSchema.safeParse({
                    phone: techPhone || undefined,
                    city: techCity,
                    specialities,
                    experienceYears,
                })
                if (!techResult.success) {
                    setErrors(techResult.error.flatten().fieldErrors as any)
                    setError('Please fix technician details')
                    setIsLoading(false)
                    return
                }
            }

            // Create account with user_metadata including role-specific details
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role,
                        phone: phoneNumber,
                        city: userCity,
                        vendor: role === 'vendor' ? {
                            company_name: companyName,
                            business_type: businessType,
                            city: vendorCity,
                            years_in_business: yearsInBusiness,
                            phone: phoneNumber || null,
                        } : undefined,
                        technician: role === 'technician' ? {
                            phone: phoneNumber || null,
                            city: techCity || null,
                            speciality: specialities.length > 0 ? JSON.stringify(specialities) : null,
                            experience_years: experienceYears || null,
                        } : undefined,
                    },
                },
            })

            if (authError) {
                setError(getErrorMessage(authError))
                return
            }

            if (data.user) {
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
            // Attempt to sign in to check if email is confirmed
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                if (error.message.includes('Email not confirmed')) {
                    toast.info('Email not confirmed yet. Please check your inbox.', { id: 'signup-confirm-pending' })
                } else {
                    toast.error(getErrorMessage(error))
                }
                return
            }

            if (data.user) {
                toast.success('Email confirmed! Logging you in...', { id: 'signup-confirm-success' })
                // Clear draft before redirecting
                clearDraft()
                setTimeout(() => router.push('/dashboard'), 1000)
            }
        } catch (err) {
            toast.error(getErrorMessage(err))
        } finally {
            setCheckingConfirmation(false)
        }
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (step < 4) {
            nextStep()
        } else {
            handleSignup()
        }
    }

    // Handle Enter key for navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // Check if user is typing in a textarea, if so allow new line
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
                                <>We've sent a confirmation link to <strong>{email}</strong>. Please verify your email to continue.</>
                            ) : (
                                <>Welcome to Medixra! Since you signed up as a <strong>{role}</strong>, our admin team will review your application. Please check your email <strong>{email}</strong> to verify your account first.</>
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

                {/* Local Toaster removed - using global toaster in layout */}
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

                    <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                        {error && <FormError message={error} />}

                        {/* STEP 1 - CHOOSE ROLE */}
                        {step === 1 && (
                            <div>
                                <p className="text-sm font-medium text-foreground mb-2">Choose your role</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('user')}
                                        className={`p-4 rounded-lg border text-center transition-all ${role === 'user' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
                                        <span className="font-medium block">Individual</span>
                                        <span className="text-xs text-muted-foreground">Buy & Sell</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setRole('technician')}
                                        className={`p-4 rounded-lg border text-center transition-all ${role === 'technician' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
                                        <span className="font-medium block">Technician</span>
                                        <span className="text-xs text-muted-foreground">Offer Services</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setRole('vendor')}
                                        className={`p-4 rounded-lg border text-center transition-all ${role === 'vendor' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
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
                                    <FormField label="Full Name" required error={errors.fullName}>
                                        <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" disabled={isLoading} />
                                    </FormField>

                                    {/* Only ask for phone number in Step 2 for users and vendors (not technicians) */}
                                    {role !== 'technician' && (
                                        <FormField label="Phone Number" required error={errors.phoneNumber}>
                                            <Input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+92 300 1234567" disabled={isLoading} />
                                        </FormField>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Email Address" required error={errors.email}>
                                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={isLoading} />
                                    </FormField>

                                    <FormField label="City" required error={errors.city}>
                                        <Select value={userCity} onValueChange={setUserCity} disabled={isLoading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a city" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CITIES.map((city) => (
                                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormField>
                                </div>

                                <FormField label="Password" required error={errors.password} helpText="Minimum 8 characters with uppercase, lowercase, and number">
                                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} />
                                </FormField>
                            </>
                        )}

                        {/* STEP 3 - ROLE-SPECIFIC DETAILS */}
                        {step === 3 && role === 'vendor' && (
                            <div className="space-y-4 pt-2">
                                <h4 className="text-sm font-semibold text-foreground">Business Details</h4>
                                <FormField label="Company Name" required error={errors.companyName}>
                                    <Input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company or business name" disabled={isLoading} />
                                </FormField>

                                <FormField label="Business Type" required error={errors.businessType}>
                                    <Input type="text" value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="Manufacturer, Distributor, Dealer..." disabled={isLoading} />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField label="City" required error={errors.city}>
                                        <Select value={vendorCity} onValueChange={setVendorCity} disabled={isLoading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a city" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CITIES.map((city) => (
                                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormField>

                                    <FormField label="Phone / WhatsApp" error={errors.phone}>
                                        <Input type="tel" value={techPhone} onChange={(e) => setTechPhone(e.target.value)} placeholder="Optional - +92 300 1234567" disabled={isLoading} />
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField label="Years in Business" error={errors.yearsInBusiness}>
                                        <Input type="text" value={yearsInBusiness} onChange={(e) => setYearsInBusiness(e.target.value)} placeholder="e.g. 3-5" disabled={isLoading} />
                                    </FormField>
                                </div>
                            </div>
                        )}

                        {step === 3 && role === 'technician' && (
                            <div className="space-y-4 pt-2">
                                <h4 className="text-sm font-semibold text-foreground">Technician Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField label="Phone / WhatsApp" error={errors.phone}>
                                        <Input type="tel" value={techPhone} onChange={(e) => setTechPhone(e.target.value)} placeholder="+92 300 1234567" disabled={isLoading} />
                                    </FormField>

                                    <FormField label="Years Experience" error={errors.experienceYears}>
                                        <Input type="text" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="e.g. 5" disabled={isLoading} />
                                    </FormField>
                                </div>

                                <FormField label="City" required error={errors.city}>
                                    <Select value={techCity} onValueChange={setTechCity} disabled={isLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a city" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CITIES.map((city) => (
                                                <SelectItem key={city} value={city}>{city}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>

                                <FormField label="Specialities" error={errors.specialities}>
                                    <MultiSelectSpecialities
                                        specialities={SPECIALTIES as any}
                                        selected={specialities}
                                        onChange={setSpecialities}
                                        disabled={isLoading}
                                    />
                                </FormField>
                            </div>
                        )}

                        {/* STEP 4 - REVIEW */}
                        {step === 4 && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-foreground">Review your information</h4>
                                <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                                    <div><strong>Name:</strong> {fullName}</div>
                                    <div><strong>Email:</strong> {email}</div>
                                    <div><strong>Phone:</strong> {role === 'technician' ? techPhone : phoneNumber}</div>
                                    <div><strong>City:</strong> {role === 'vendor' ? vendorCity : role === 'technician' ? techCity : userCity}</div>
                                    <div><strong>Role:</strong> {role}</div>
                                    {role === 'vendor' && (
                                        <>
                                            <div><strong>Company:</strong> {companyName}</div>
                                            <div><strong>Business Type:</strong> {businessType}</div>
                                            <div><strong>City:</strong> {vendorCity}</div>
                                        </>
                                    )}
                                    {role === 'technician' && (
                                        <>
                                            <div><strong>Specialities:</strong> {specialities.length > 0 ? specialities.join(', ') : 'Not specified'}</div>
                                            <div><strong>City:</strong> {techCity}</div>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-between">
                                    <Button type="button" variant="outline" size="sm" onClick={() => { setStep(1); }}>Edit Role</Button>
                                    <Button type="button" variant="outline" size="sm" onClick={() => { setStep(2); }}>Edit Account</Button>
                                    {role !== 'user' && (
                                        <Button type="button" variant="outline" size="sm" onClick={() => { setStep(3); }}>Edit Details</Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 justify-between pt-6">
                            <div className="flex gap-2">
                                {step > 1 ? (
                                    <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading}>Back</Button>
                                ) : (
                                    <Button type="button" variant="outline" onClick={() => { clearDraft(); setEmail(''); setFullName(''); setUserCity(''); setRole('user'); setCompanyName(''); setBusinessType(''); setVendorCity(''); setTechPhone(''); setTechCity(''); setSpecialities([]); setExperienceYears(''); }}>Clear Draft</Button>
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
