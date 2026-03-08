import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import EngineersClientPage from './client-page'
import { getApprovedEngineers } from '@/lib/actions/engineer'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Certified Engineers Directory',
  description: 'Connect with certified equipment repair experts and medical engineers across Pakistan.',
}

export default async function EngineersPage() {
  const approvedEngineers = await getApprovedEngineers()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <EngineersClientPage initialEngineers={approvedEngineers} />
      <Footer />
    </div>
  )
}
