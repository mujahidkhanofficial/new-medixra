'use server'

import { db } from '@/lib/db/drizzle'
import { blogs } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAdminBlogs() {
    const supabase = await createClient()
    if (!supabase) throw new Error('Internal Server Error: Supabase connection failed')
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata.role !== 'admin') {
        throw new Error('Unauthorized')
    }

    const allBlogs = await db.query.blogs.findMany({
        orderBy: [desc(blogs.createdAt)],
        with: {
            author: true
        }
    })

    return allBlogs
}

export async function saveBlog(data: {
    id?: string,
    title: string,
    slug: string,
    content: string,
    excerpt: string,
    status: 'draft' | 'published',
    metaTitle: string,
    metaDescription: string,
    coverImageUrl: string
}) {
    const supabase = await createClient()
    if (!supabase) throw new Error('Internal Server Error: Supabase connection failed')
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata.role !== 'admin') {
        throw new Error('Unauthorized')
    }

    const payload = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        coverImageUrl: data.coverImageUrl,
        authorId: user.id,
        publishedAt: data.status === 'published' ? new Date().toISOString() : null
    }

    if (data.id) {
        await db.update(blogs).set(payload).where(eq(blogs.id, data.id))
    } else {
        await db.insert(blogs).values(payload)
    }

    revalidatePath('/admin')
    revalidatePath('/blogs')
    return { success: true }
}

export async function deleteBlog(id: string) {
    const supabase = await createClient()
    if (!supabase) throw new Error('Internal Server Error: Supabase connection failed')
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata.role !== 'admin') {
        throw new Error('Unauthorized')
    }

    await db.delete(blogs).where(eq(blogs.id, id))

    revalidatePath('/admin')
    revalidatePath('/blogs')
    return { success: true }
}

export async function getPublicBlogs() {
    return await db.query.blogs.findMany({
        where: eq(blogs.status, 'published'),
        orderBy: [desc(blogs.publishedAt)],
        with: {
            author: true
        }
    })
}

export async function getBlogBySlug(slug: string) {
    return await db.query.blogs.findFirst({
        where: and(eq(blogs.status, 'published'), eq(blogs.slug, slug)),
        with: {
            author: true
        }
    })
}
