import { db } from '@/lib/db/drizzle'
import { profiles, vendors, engineers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Navigation from '@/components/navigation'
import { Badge } from '@/components/ui/badge'
import { User, MapPin, Briefcase, Clock, Calendar, Shield } from 'lucide-react'
import WhatsappUnmask from './WhatsappUnmask'

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const p = await params;

    // Fetch base profile
    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, p.id),
        with: {
            vendors: true,
            engineers: true
        }
    })

    if (!profile) return notFound()

    const isVendor = profile.role === 'vendor' && profile.vendors.length > 0
    const isEngineer = profile.role === 'engineer' && profile.engineers.length > 0
    const isAdmin = profile.role === 'admin'

    const vendorData = isVendor ? profile.vendors[0] : null
    const engineerData = isEngineer ? profile.engineers[0] : null

    // Determine the Whatsapp Number to unmask
    let whatsapp = profile.phone
    if (isVendor && vendorData?.whatsappNumber) whatsapp = vendorData.whatsappNumber
    // Engineers don't have a specific whatsapp col in the schema, so fallback to profile.phone

    return (
        <main className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
            <Navigation />

            <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex-1">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-32 bg-teal-600 relative">
                        <div className="absolute inset-0 opacity-10 bg-[url('/bg-pattern.svg')]" />
                    </div>

                    <div className="px-6 sm:px-10 pb-10">
                        {/* Avatar Overlay */}
                        <div className="relative -mt-16 mb-6 flex justify-between items-end">
                            <div className="h-32 w-32 rounded-full border-4 border-white bg-teal-100 shadow-md flex items-center justify-center overflow-hidden z-10">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.fullName || 'User'} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-teal-800">
                                        {(profile.fullName || profile.email || 'U')[0].toUpperCase()}
                                    </span>
                                )}
                            </div>

                            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 capitalize font-bold px-3 py-1">
                                {profile.role}
                            </Badge>
                        </div>

                        {/* Profile Info */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                {isVendor ? vendorData?.businessName : profile.fullName || 'Anonymous User'}
                            </h1>
                            {isVendor && profile.fullName && (
                                <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                                    <User className="h-4 w-4" /> Representative: {profile.fullName}
                                </p>
                            )}
                            {(profile.city || vendorData?.city || engineerData?.city) && (
                                <p className="text-gray-500 font-medium flex items-center gap-2 mt-1 capitalize">
                                    <MapPin className="h-4 w-4" /> {profile.city || vendorData?.city || engineerData?.city}
                                </p>
                            )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid sm:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900 border-b pb-2">Professional Details</h3>

                                {isEngineer && (
                                    <>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Briefcase className="h-4 w-4 text-teal-500 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Speciality</p>
                                                <p className="text-gray-600">{engineerData?.speciality || 'Not specified'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Clock className="h-4 w-4 text-teal-500 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Experience</p>
                                                <p className="text-gray-600">{engineerData?.experienceYears || 'Not specified'} Years</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isVendor && (
                                    <>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Briefcase className="h-4 w-4 text-teal-500 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Business Type</p>
                                                <p className="text-gray-600">{vendorData?.businessType || 'Retailer'}</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {!isVendor && !isEngineer && !isAdmin && (
                                    <div className="text-sm text-gray-500 italic">User is a standard buyer on the platform.</div>
                                )}

                                {isAdmin && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <Shield className="h-4 w-4 text-teal-500 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Platform Management</p>
                                            <p className="text-gray-600">Official Medixra Administrator</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900 border-b pb-2">Contact & Activity</h3>

                                <div className="flex items-start gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-teal-500 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Joined Platform</p>
                                        <p className="text-gray-600">
                                            {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Communication Action */}
                        <div className="pt-6 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg">Send a direct message</h3>
                                <p className="text-sm text-gray-500">Connect securely over WhatsApp.</p>
                            </div>

                            <WhatsappUnmask
                                phoneNumber={whatsapp}
                                defaultText={`Hi ${profile.fullName || 'there'}, I found your profile on the Medixra Community.`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
