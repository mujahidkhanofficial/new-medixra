import { getBlogBySlug } from '@/lib/actions/blogs'
import { notFound } from 'next/navigation'
import Navigation from '@/components/navigation'
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata, ResolvingMetadata } from 'next'
import 'react-quill-new/dist/quill.snow.css'

// Dynamic MetaData Generation for Next.js SEO
export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const p = await params;
    const blog = await getBlogBySlug(p.slug)

    if (!blog) {
        return {
            title: 'Article Not Found',
        }
    }

    const previousImages = (await parent).openGraph?.images || []

    return {
        title: blog.metaTitle || `${blog.title} | Pakmedinex Blog`,
        description: blog.metaDescription || blog.excerpt || blog.title,
        openGraph: {
            title: blog.metaTitle || blog.title,
            description: blog.metaDescription || blog.excerpt || blog.title,
            type: 'article',
            publishedTime: blog.publishedAt!,
            authors: [blog.author?.fullName || 'Pakmedinex Admin'],
            images: blog.coverImageUrl ? [blog.coverImageUrl, ...previousImages] : previousImages,
        },
        twitter: {
            card: 'summary_large_image',
            title: blog.metaTitle || blog.title,
            description: blog.metaDescription || blog.excerpt || blog.title,
            images: blog.coverImageUrl ? [blog.coverImageUrl] : [],
        }
    }
}

export const revalidate = 3600 // Cache heavily for 1 hr

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const p = await params;
    const blog = await getBlogBySlug(p.slug)

    if (!blog) return notFound()

    // Clean estimate reading time calculation
    const wordCount = blog.content.split(/\s+/).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 225)) // 225 WPM average

    return (
        <main className="min-h-screen flex flex-col bg-white">
            <Navigation />

            <article className="flex-1">
                {/* Visual Header Background (Split Design) */}
                <div className="bg-teal-900 border-b relative">
                    <div className="absolute inset-0 opacity-10 bg-[url('/bg-pattern.svg')]" />
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative text-center">
                        <Badge variant="outline" className="mb-6 text-teal-100 border-teal-500 bg-teal-800/50 font-semibold tracking-wider px-4 py-1.5 uppercase text-xs">
                            Articles & Insights
                        </Badge>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-teal-100">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-white text-teal-800 flex items-center justify-center text-xs font-bold ring-2 ring-teal-500/30">
                                    {(blog.author?.fullName || blog.author?.email || 'M')[0].toUpperCase()}
                                </div>
                                <span className="font-semibold text-white">{blog.author?.fullName || 'Pakmedinex Admin'}</span>
                            </div>
                            <span className="opacity-30 hidden sm:inline">•</span>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <time dateTime={blog.publishedAt!}>
                                    {new Date(blog.publishedAt!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </time>
                            </div>
                            <span className="opacity-30 hidden sm:inline">•</span>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{readingTime} min read</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-32">
                    {/* Cover Image Overlaying Header */}
                    {blog.coverImageUrl && (
                        <div className="relative -mt-10 lg:-mt-16 mb-16 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5 aspect-[16/9] lg:aspect-[21/9] bg-gray-100">
                            <Image
                                src={blog.coverImageUrl}
                                alt={blog.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {!blog.coverImageUrl && <div className="h-16" />}

                    {/* Native WYSIWYG Renderer (Enforces exact 1:1 styling parity with the Admin panel) */}
                    <div className="ql-snow max-w-none">
                        <div
                            className="ql-editor !p-0 text-base md:text-lg text-gray-800"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </div>

                    <div className="mt-16 pt-8 border-t border-gray-100">
                        <Link href="/blogs" className="inline-flex items-center font-bold text-teal-600 hover:text-teal-700 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to all articles
                        </Link>
                    </div>
                </div>
            </article>
        </main>
    )
}
