'use client'

import { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getAdminBlogs, saveBlog, deleteBlog } from '@/lib/actions/blogs'
import { uploadImage } from '@/lib/actions/upload'
import { Plus, Edit, Trash2, Globe, EyeOff, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'image', 'link'],
        ['clean']
    ]
}

export function BlogManager() {
    const [blogs, setBlogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [editingBlog, setEditingBlog] = useState<any | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Form State
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [content, setContent] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [metaTitle, setMetaTitle] = useState('')
    const [metaDescription, setMetaDescription] = useState('')
    const [coverImageUrl, setCoverImageUrl] = useState('')

    useEffect(() => {
        loadBlogs()
    }, [])

    // Add explicit Hover tooltips to the Quill WYSIWYG editor toolbar
    useEffect(() => {
        if (isEditorOpen) {
            const timer = setTimeout(() => {
                const addTitle = (selector: string, title: string) => {
                    document.querySelectorAll(selector).forEach(el => el.setAttribute('title', title))
                }

                addTitle('.ql-bold', 'Bold')
                addTitle('.ql-italic', 'Italic')
                addTitle('.ql-underline', 'Underline')
                addTitle('.ql-strike', 'Strikethrough')
                addTitle('.ql-script[value="sub"]', 'Subscript')
                addTitle('.ql-script[value="super"]', 'Superscript')
                addTitle('.ql-list[value="ordered"]', 'Numbered List')
                addTitle('.ql-list[value="bullet"]', 'Bullet List')
                addTitle('.ql-indent[value="-1"]', 'Decrease Indent')
                addTitle('.ql-indent[value="+1"]', 'Increase Indent')
                addTitle('.ql-blockquote', 'Blockquote')
                addTitle('.ql-image', 'Insert Image')
                addTitle('.ql-link', 'Insert Link')
                addTitle('.ql-clean', 'Clear Formatting')
                addTitle('.ql-header', 'Heading Style')
                addTitle('.ql-color', 'Text Color')
                addTitle('.ql-background', 'Background Color')
                addTitle('.ql-align', 'Text Alignment')
            }, 200)
            return () => clearTimeout(timer)
        }
    }, [isEditorOpen])

    const loadBlogs = async () => {
        try {
            const data = await getAdminBlogs()
            setBlogs(data)
        } catch (error) {
            toast.error("Failed to load blogs")
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenEditor = (blog?: any) => {
        if (blog) {
            setEditingBlog(blog)
            setTitle(blog.title)
            setSlug(blog.slug)
            setContent(blog.content)
            setExcerpt(blog.excerpt || '')
            setMetaTitle(blog.metaTitle || '')
            setMetaDescription(blog.metaDescription || '')
            setCoverImageUrl(blog.coverImageUrl || '')
        } else {
            setEditingBlog(null)
            setTitle('')
            setSlug('')
            setContent('')
            setExcerpt('')
            setMetaTitle('')
            setMetaDescription('')
            setCoverImageUrl('')
        }
        setIsEditorOpen(true)
    }

    const autoGenerateSlug = (text: string) => {
        setSlug(text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const result = await uploadImage(formData)
            if (result.success && result.url) {
                setCoverImageUrl(result.url)
                toast.success('Image uploaded successfully')
            } else {
                toast.error(result.error || 'Failed to upload image')
            }
        } catch (err) {
            toast.error('An error occurred during upload')
        } finally {
            setIsUploading(false)
        }
    }

    const handleSave = (status: 'draft' | 'published') => {
        if (!title || !slug || !content) {
            toast.error("Title, Slug, and Content are required")
            return
        }

        startTransition(async () => {
            try {
                await saveBlog({
                    id: editingBlog?.id,
                    title,
                    slug,
                    content,
                    excerpt,
                    metaTitle,
                    metaDescription,
                    coverImageUrl,
                    status
                })
                toast.success(`Blog ${status === 'published' ? 'published' : 'saved to drafts'}`)
                setIsEditorOpen(false)
                loadBlogs()
            } catch (error: any) {
                toast.error(error.message || "Failed to save blog")
            }
        })
    }

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) return

        startTransition(async () => {
            try {
                await deleteBlog(id)
                toast.success("Blog deleted")
                loadBlogs()
            } catch (error) {
                toast.error("Failed to delete blog")
            }
        })
    }

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Content Management System</h3>
                    <p className="text-sm text-gray-500">Create, edit, and publish SEO-optimized articles.</p>
                </div>
                <Button onClick={() => handleOpenEditor()} className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> New Article
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                        <tr>
                            <th className="text-left py-4 px-6">Article Info</th>
                            <th className="text-left py-4 px-6">Status</th>
                            <th className="text-left py-4 px-6">Published</th>
                            <th className="text-right py-4 px-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {blogs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-gray-500">No articles created yet.</td>
                            </tr>
                        ) : blogs.map((blog) => (
                            <tr key={blog.id} className="hover:bg-gray-50/50">
                                <td className="py-4 px-6">
                                    <p className="font-bold text-gray-900">{blog.title}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-sm">/{blog.slug}</p>
                                </td>
                                <td className="py-4 px-6">
                                    {blog.status === 'published' ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <Globe className="mr-1 h-3 w-3" /> Published
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                                            <EyeOff className="mr-1 h-3 w-3" /> Draft
                                        </Badge>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500">
                                    {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditor(blog)}>
                                        <Edit className="h-4 w-4 text-gray-500 hover:text-teal-600" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.id)}>
                                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle>{editingBlog ? 'Edit Article' : 'New Article'}</SheetTitle>
                        <SheetDescription>Write and configure your SEO article.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700">Cover Image URL</label>
                                <div className="flex gap-2 mt-1">
                                    <ImageIcon className="h-10 w-10 text-gray-400 p-2 bg-gray-50 rounded border shrink-0" />
                                    <Input
                                        placeholder="https://example.com/image.jpg"
                                        value={coverImageUrl}
                                        onChange={e => setCoverImageUrl(e.target.value)}
                                    />
                                    <div className="relative shrink-0 w-[120px]">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-[120px]"
                                        />
                                        <Button type="button" variant="secondary" disabled={isUploading} className="w-[120px]">
                                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Upload File'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Title *</label>
                                <Input
                                    placeholder="Enter article title"
                                    value={title}
                                    onChange={e => {
                                        setTitle(e.target.value);
                                        autoGenerateSlug(e.target.value);
                                    }}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">URL Slug *</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-400 text-sm bg-gray-50 px-3 py-2 rounded-md border">medixra.com/blogs/</span>
                                    <Input
                                        placeholder="url-friendly-slug"
                                        value={slug}
                                        readOnly
                                        disabled
                                        className="bg-gray-50 text-gray-500 font-mono tracking-tight cursor-not-allowed border-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <label className="text-sm font-bold text-gray-700">Blog Content *</label>
                                <div className="mt-2 bg-white pb-16">
                                    <ReactQuill
                                        theme="snow"
                                        value={content}
                                        onChange={setContent}
                                        modules={quillModules}
                                        className="h-[350px]"
                                        placeholder="Write your article here using the rich text editor..."
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-teal-600" /> SEO Configuration
                                </h4>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Meta Title</label>
                                    <Input
                                        placeholder="Optimal length 50-60 characters..."
                                        value={metaTitle}
                                        onChange={e => setMetaTitle(e.target.value)}
                                        className="mt-1 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Meta Description / Excerpt</label>
                                    <Textarea
                                        placeholder="A brief summary for Google Search & preview cards (150-160 characters)..."
                                        value={metaDescription || excerpt}
                                        onChange={e => {
                                            setMetaDescription(e.target.value);
                                            setExcerpt(e.target.value);
                                        }}
                                        className="mt-1 bg-white h-24 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 border-t mt-8">
                            <Button variant="outline" onClick={() => setIsEditorOpen(false)} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button variant="secondary" onClick={() => handleSave('draft')} disabled={isPending}>
                                Save Draft
                            </Button>
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => handleSave('published')} disabled={isPending}>
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                                Publish Article
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
