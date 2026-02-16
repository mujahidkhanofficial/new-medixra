'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MoreHorizontal, Trash2, Eye, MessageCircle, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteAd } from '@/lib/actions/ads'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Ad {
    id: string
    name: string
    price: number | string
    currency: string | null
    views: number | null
    whatsappClicks: number | null
    status: string | null
    createdAt: string
    imageUrl: string | null
}

export function AdsTable({ ads }: { ads: Ad[] }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        setIsDeleting(id)
        try {
            const result = await deleteAd(id)
            if (result.success) {
                toast.success('Ad deleted successfully')
                router.refresh()
            } else {
                toast.error(result.message || 'Failed to delete ad')
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setIsDeleting(null)
        }
    }

    if (ads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Eye className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No ads posted yet</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    Create your first ad to reach thousands of buyers.
                </p>
                <Button asChild>
                    <Link href="/post-ad">Post an Ad</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-card">
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[80px]">Image</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Details</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Stats</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {ads.map((ad) => (
                            <tr key={ad.id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-4 align-middle">
                                    <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted">
                                        {ad.imageUrl ? (
                                            <Image
                                                src={ad.imageUrl}
                                                alt={ad.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-secondary">
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 align-middle">
                                    <div className="flex flex-col">
                                        <span className="font-medium line-clamp-1">{ad.name}</span>
                                        <span className="text-muted-foreground">
                                            {ad.currency || 'PKR'} {Number(ad.price).toLocaleString()}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 align-middle hidden md:table-cell">
                                    <div className="flex items-center gap-4 text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            <span className="text-xs">{ad.views || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="h-4 w-4" />
                                            <span className="text-xs">{ad.whatsappClicks || 0}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 align-middle hidden sm:table-cell">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${ad.status === 'active'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        : ad.status === 'suspended'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            : ad.status === 'archived'
                                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                        }`}>
                                        {(ad.status || 'draft').charAt(0).toUpperCase() + (ad.status || 'draft').slice(1)}
                                    </span>
                                </td>
                                <td className="p-4 align-middle text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/product/${ad.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Ad
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/post-ad/${ad.id}`}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit Ad
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(ad.id)} disabled={isDeleting === ad.id}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {isDeleting === ad.id ? 'Deleting...' : 'Delete'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
