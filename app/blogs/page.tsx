import { getPublicBlogs } from '@/lib/actions/blogs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import Navigation from '@/components/navigation'

export const metadata: Metadata = {
    title: 'Medical Business & Technology Blog | Pakmedinex',
    description: 'Read the latest insights on medical equipment procurement, biomedical engineering updates, and DRAP compliance in Pakistan.',
    openGraph: {
        title: 'Medical Business & Technology Blog | Pakmedinex',
        description: 'Read the latest insights on medical equipment procurement, biomedical engineering updates, and DRAP compliance.',
    }
}

export const revalidate = 3600 // Cache for 1 hour

export default async function BlogsIndexPage() {
    const blogs = await getPublicBlogs()

    return (
        <main className="min-h-screen bg-gray-50/50">
            <Navigation />

            {/* Hero Section */}
            <section className="bg-teal-900 border-b relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('/bg-pattern.svg')]" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center text-white">
                    <Badge variant="outline" className="mb-6 text-teal-100 border-teal-500 bg-teal-800/50 font-semibold tracking-wider px-4 py-1.5 uppercase text-xs">
                        Official Updates & Insights
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Pakmedinex Business Blog
                    </h1>
                    <p className="text-lg md:text-xl text-teal-100/90 max-w-2xl mx-auto font-medium">
                        Expert analyses on medical equipment trends, engineering standards, and healthcare modernization in Pakistan.
                    </p>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.length === 0 ? (
                        <div className="col-span-full py-24 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No articles published yet</h3>
                            <p className="text-gray-500">Check back soon for insights and updates from the Pakmedinex team.</p>
                        </div>
                    ) : (
                        blogs.map((blog) => (
                            <Link href={`/blogs/${blog.slug}`} key={blog.id} className="group flex flex-col h-full ring-offset-2 focus-visible:ring-2 focus-visible:ring-teal-500 rounded-2xl outline-none">
                                <Card className="flex flex-col h-full overflow-hidden border-0 shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:shadow-xl hover:ring-teal-200 hover:-translate-y-1">
                                    <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden border-b border-gray-100">
                                        {blog.coverImageUrl ? (
                                            <Image
                                                src={blog.coverImageUrl}
                                                alt={blog.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
                                                <span className="text-teal-900/10 font-bold text-4xl transform -rotate-12">Pakmedinex</span>
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader className="flex-1 px-6 pt-6 pb-4">
                                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-4 tracking-wide uppercase">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 bg-gray-100 rounded text-gray-400" />
                                                <time dateTime={blog.publishedAt!}>
                                                    {new Date(blog.publishedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </time>
                                            </div>
                                        </div>
                                        <CardTitle className="text-xl font-bold text-gray-900 leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
                                            {blog.title}
                                        </CardTitle>
                                        <CardDescription className="text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                                            {blog.excerpt || blog.metaDescription}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 mt-auto">
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-700">
                                                    {(blog.author?.fullName || blog.author?.email || 'M')[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">
                                                    {blog.author?.fullName || 'Pakmedinex Admin'}
                                                </span>
                                            </div>
                                            <span className="flex items-center text-sm font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
                                                Read <ArrowRight className="ml-1 h-4 w-4" />
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </section>
        </main>
    )
}
