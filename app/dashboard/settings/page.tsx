import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './profile-form'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export const metadata = {
    title: 'Settings - Medixra',
    description: 'Manage your profile settings',
}

export default async function SettingsPage() {
    const supabase = await createClient()
    if (!supabase) redirect('/login')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, vendors(*)')
        .eq('id', user.id)
        .single()

    if (!profile) redirect('/login')

    const isVendor = profile.role === 'vendor'
    const vendorData = Array.isArray(profile.vendors) ? profile.vendors[0] : profile.vendors

    const initialData = {
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        email: profile.email || '',
        isVendor: isVendor,
        businessType: isVendor && vendorData?.business_type ? vendorData.business_type : '',
        yearsInBusiness: isVendor && vendorData?.years_in_business ? vendorData.years_in_business : '',
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />
            <main className="flex-1 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

                    <div className="grid gap-8 md:grid-cols-[250px_1fr]">
                        <nav className="flex flex-col space-y-1">
                            <a className="bg-primary/10 text-primary font-medium px-4 py-2 rounded-md" href="#">
                                Profile
                            </a>
                            {/* Future: Security, Notifications, etc. */}
                        </nav>

                        <div className="bg-card rounded-xl border p-6">
                            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                            <ProfileForm initialData={initialData} />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
