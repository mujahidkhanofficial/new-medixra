'use client'
// Force IDE refresh


import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import { adminGetAllProducts, adminDeleteProduct, adminUpdateProductStatus } from '@/lib/actions/admin-products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, MoreHorizontal, Search, Trash, Ban, CheckCircle, Eye, PackagePlus } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface ProductAndVendor {
    id: string
    name: string
    category: string
    price: string
    status: string | null
    brand: string | null
    model: string | null
    createdAt: string
    vendorName: string | null
    vendorEmail: string | null
    imageUrl: string | null
}

export function ProductManager() {
    const [products, setProducts] = useState<ProductAndVendor[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [isPending, startTransition] = useTransition()

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts()
        }, 500)
        return () => clearTimeout(timer)
    }, [search, page, statusFilter, categoryFilter])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const result = await adminGetAllProducts({
                page,
                limit: 10,
                search,
                status: statusFilter,
                category: categoryFilter
            })

            if (result.success && result.data) {
                setProducts(result.data.products)
                setTotalPages(result.data.totalPages)
            } else {
                toast.error('Failed to load products')
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = (productId: string) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this product? This cannot be undone.')) return

        startTransition(async () => {
            const result = await adminDeleteProduct({ productId })
            if (result.success) {
                toast.success('Product deleted')
                fetchProducts()
            } else {
                toast.error(result.error || 'Failed to delete product')
            }
        })
    }

    const handleStatusUpdate = (productId: string, newStatus: 'active' | 'suspended') => {
        startTransition(async () => {
            const result = await adminUpdateProductStatus({ productId, status: newStatus })
            if (result.success) {
                toast.success(`Product ${newStatus}`)
                // Optimistic update
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p))
            } else {
                toast.error(result.error || 'Failed to update status')
            }
        })
    }

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
            case 'suspended':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Suspended</Badge>
            case 'sold':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Sold</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search by name, brand, or model..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                </Select>
                {/* Can add Category Select here if needed, keeping it simple for now */}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-teal-600" />
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                    No products found
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-md bg-gray-100 relative overflow-hidden shrink-0 border border-gray-200">
                                                {product.imageUrl ? (
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="40px"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full w-full text-gray-400">
                                                        <PackagePlus className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 line-clamp-1">{product.name}</span>
                                                <span className="text-xs text-gray-500 line-clamp-1">{product.brand} {product.model}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-900">{product.vendorName || 'Unknown'}</span>
                                            <span className="text-xs text-gray-500">{product.vendorEmail}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell className="font-medium">PKR {Number(product.price).toLocaleString()}</TableCell>
                                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" disabled={isPending}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/product/${product.id}`} target="_blank">
                                                        <Eye className="mr-2 h-4 w-4" /> View Item
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {product.status !== 'active' && (
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(product.id, 'active')}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Activate
                                                    </DropdownMenuItem>
                                                )}
                                                {product.status !== 'suspended' && (
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(product.id, 'suspended')}>
                                                        <Ban className="mr-2 h-4 w-4 text-orange-600" /> Suspend
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-600 focus:text-red-600">
                                                    <Trash className="mr-2 h-4 w-4" /> Delete Permanently
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                >
                    Previous
                </Button>
                <div className="text-sm font-medium">
                    Page {page} of {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
