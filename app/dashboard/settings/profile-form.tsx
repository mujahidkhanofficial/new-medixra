'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateProfile } from '@/lib/actions/profile'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface ProfileFormProps {
    initialData: {
        fullName: string
        phone: string
        city: string
        email: string
        isVendor?: boolean
        businessType?: string
        yearsInBusiness?: string
    }
}

const CITIES = [
    'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Other'
]

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)

        try {
            const result = await updateProfile(null, formData)

            if (result.success) {
                toast.success(result.message)
                router.refresh()
            } else {
                toast.error(result.message || 'Failed to update profile')
                if (result.errors && Object.keys(result.errors).length > 0) {
                    // Could show field specific errors here
                    console.error('Validation errors:', result.errors)
                }
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6 max-w-xl">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    value={initialData.email}
                    disabled
                    className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={initialData.fullName}
                    required
                    minLength={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                    id="phone"
                    name="phone"
                    defaultValue={initialData.phone}
                    required
                    minLength={10}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select name="city" defaultValue={initialData.city || undefined}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                        {CITIES.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {initialData.isVendor && (
                <>
                    <div className="space-y-2 pt-4 border-t border-border mt-6">
                        <Label htmlFor="businessType" className="font-semibold text-primary">Vendor Business Type</Label>
                        <Input
                            id="businessType"
                            name="businessType"
                            defaultValue={initialData.businessType}
                            placeholder="e.g. Manufacturer, Retailer, Importer"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="yearsInBusiness" className="font-semibold text-primary">Years of Experience</Label>
                        <Input
                            id="yearsInBusiness"
                            name="yearsInBusiness"
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={initialData.yearsInBusiness}
                            placeholder="e.g. 5"
                        />
                    </div>
                </>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-6">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    )
}
