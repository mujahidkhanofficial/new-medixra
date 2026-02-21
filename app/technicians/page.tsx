import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import TechniciansClientPage from './client-page'
import { getApprovedTechnicians } from '@/lib/actions/technician'

export const dynamic = 'force-dynamic'

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
