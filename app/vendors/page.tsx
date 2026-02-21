import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import VendorsClientPage from './client-page'
import { getApprovedVendors } from '@/lib/actions/vendors'

export const dynamic = 'force-dynamic'

export default async function VendorsDirectoryPage() {
    const approvedVendors = await getApprovedVendors()

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            <VendorsClientPage initialVendors={approvedVendors} />
            <Footer />
        </div>
    )
}
