import { getInitialMessages } from '@/lib/actions/community'
import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/navigation'
import CommunityFeed from './CommunityFeed'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Community Board | Pakmedinex',
    description: 'Join the real-time global discussion. Connect with vendors, biomeds, and buyers instantly.',
}

export default async function CommunityPage() {
    // 1. Fetch Auth state so we know if the user can post
    const supabase = await createClient()
    if (!supabase) return <div>Auth system offline</div>

    const { data: { user } } = await supabase.auth.getUser()

    // 2. Fetch the last 50 messages instantly on the server (zero client loading states)
    const initialMessages = await getInitialMessages()

    return (
        <main className="min-h-screen flex flex-col bg-gray-50/50">
            <Navigation />

            <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                <div className="bg-white border-b sticky top-0 z-10">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Live Community</h1>
                        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                            Broadcast requirements, find specialized engineers, and connect instantly.
                        </p>
                    </div>
                </div>

                <div className="flex-1 bg-gray-50 overflow-hidden relative">
                    <div className="absolute inset-0 mx-auto max-w-5xl flex flex-col shadow-xl bg-white lg:border-x">
                        <CommunityFeed
                            initialMessages={initialMessages}
                            currentUser={user}
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}
