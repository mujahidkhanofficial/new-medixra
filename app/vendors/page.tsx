import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import VendorsClientPage from './client-page'
import { getApprovedVendors } from '@/lib/actions/vendors'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Verified Vendors Directory',
    description: 'Browse our network of trusted medical distributors and sellers across Pakistan.',
}

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
