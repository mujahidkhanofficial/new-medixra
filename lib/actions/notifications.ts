'use server'

import { db } from '@/lib/db/drizzle'
import { notifications } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { authenticatedAction } from '@/lib/safe-action'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const GetNotificationsSchema = z.object({})

export const getNotifications = authenticatedAction(
    GetNotificationsSchema,
    async (_, userId) => {
        const data = await db.query.notifications.findMany({
            where: eq(notifications.userId, userId),
            orderBy: [desc(notifications.createdAt)],
            limit: 20
        })

        // Count unread
        const unreadCount = data.filter(n => !n.isRead).length

        return { notifications: data, unreadCount }
    }
)

const MarkReadSchema = z.object({
    notificationId: z.string()
})

export const markNotificationAsRead = authenticatedAction(
    MarkReadSchema,
    async ({ notificationId }, userId) => {
        await db.update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.id, notificationId),
                eq(notifications.userId, userId)
            ))

        revalidatePath('/')
        return { success: true }
    }
)

const MarkAllReadSchema = z.object({})

export const markAllNotificationsAsRead = authenticatedAction(
    MarkAllReadSchema,
    async (_, userId) => {
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId))

        revalidatePath('/')
        return { success: true }
    }
)

// Internal use only - not exposed as an action
export async function createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string
) {
    try {
        await db.insert(notifications).values({
            userId,
            type,
            title,
            message,
            link,
        })
    } catch (error) {
        console.error('Failed to create notification:', error)
    }
}
