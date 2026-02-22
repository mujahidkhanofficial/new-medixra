import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import TechniciansClientPage from './client-page'
import { getApprovedTechnicians } from '@/lib/actions/technician'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Certified Technicians Directory',
  description: 'Connect with certified equipment repair experts and medical technicians across Pakistan.',
}

export default async function TechniciansPage() {
  const approvedTechnicians = await getApprovedTechnicians()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <TechniciansClientPage initialTechnicians={approvedTechnicians} />
      <Footer />
    </div>
  )
}
