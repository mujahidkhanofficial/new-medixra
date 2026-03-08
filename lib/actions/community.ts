'use server'

import { db } from '@/lib/db/drizzle'
import { communityMessages, profiles } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type CommunityMessageWithUser = {
    id: string
    content: string
    createdAt: string
    replyToId: string | null
    user: {
        id: string
        fullName: string | null
        avatarUrl: string | null
        role: string | null
    }
}

export async function getInitialMessages(): Promise<CommunityMessageWithUser[]> {
    try {
        const messages = await db.query.communityMessages.findMany({
            orderBy: [desc(communityMessages.createdAt)],
            limit: 50,
            with: {
                user: {
                    columns: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                        role: true,
                    }
                }
            }
        })

        // Return them in ascending order so the newest are at the bottom of the feed
        return messages.reverse() as unknown as CommunityMessageWithUser[]
    } catch (error) {
        console.error('Failed to fetch initial community messages:', error)
        return []
    }
}

// Simple in-memory rate limiting map (Note: in serverless environments, this resets per lambda cold start,
// but it's sufficient for basic abuse prevention. For enterprise, use Redis/Memcached).
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_WINDOW_MS = 10000 // 10 seconds

export async function postMessage(content: string, replyToId?: string, clientGeneratedId?: string) {
    try {
        if (!content || content.trim().length === 0) {
            return { success: false, error: 'Message cannot be empty.' }
        }

        if (content.length > 2000) {
            return { success: false, error: 'Message is too long (max 2000 characters).' }
        }

        const supabase = await createClient()
        if (!supabase) return { success: false, error: 'Auth context missing' }

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: 'You must be logged in to post.' }
        }

        // --- Rate Limiting ---
        const lastPostTime = rateLimitMap.get(user.id)
        if (lastPostTime && (Date.now() - lastPostTime) < RATE_LIMIT_WINDOW_MS) {
            return { success: false, error: 'Please wait a few seconds before posting again.' }
        }
        rateLimitMap.set(user.id, Date.now())
        // ---------------------

        await db.insert(communityMessages).values({
            id: clientGeneratedId,
            userId: user.id,
            content: content.trim(),
            replyToId: replyToId || null,
        })

        // WebSockets push the message instantly via Postgres Changes, but we also refresh the server cache
        revalidatePath('/community')
        return { success: true }

    } catch (error: any) {
        console.error('Post message error:', error)
        return { success: false, error: error.message || 'Failed to post message. Please try again later.' }
    }
}
