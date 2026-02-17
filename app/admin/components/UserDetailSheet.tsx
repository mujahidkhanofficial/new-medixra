import { useState, useEffect, useTransition } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mail, Phone, MapPin, Calendar, Shield, Package, Clock, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import Link from 'next/link'
import { getUserDetails } from '@/lib/actions/admin'
import { formatDistanceToNow } from 'date-fns'

interface UserDetailSheetProps {
    user: any | null
    isOpen: boolean
    onClose: () => void
}

export function UserDetailSheet({ user, isOpen, onClose }: UserDetailSheetProps) {
    const [details, setDetails] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen && user?.id) {
            setIsLoading(true)
            setError('')
            setDetails(null)

            getUserDetails(user.id)
                .then(data => setDetails(data))
                .catch(err => {
                    console.error("Failed to fetch user details:", err)
                    setError('Failed to load detailed profile data')
                })
                .finally(() => setIsLoading(false))
        }
    }, [isOpen, user?.id])

    if (!user) return null

    // Use fetched profile if available, otherwise fallback to passed prop (which might be partial)
    const displayUser = details?.profile ? {
        ...user,
        ...details.profile, // Overwrite with fresh data
        joined: new Date(details.profile.createdAt).toLocaleDateString()
    } : user

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-gray-100">
                            <AvatarImage src={displayUser.avatarUrl} />
                            <AvatarFallback className="text-xl bg-teal-100 text-teal-700">
                                {displayUser.name?.charAt(0).toUpperCase() || displayUser.fullName?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <SheetTitle className="text-2xl font-bold">{displayUser.name || displayUser.fullName}</SheetTitle>
                            <SheetDescription className="flex items-center gap-2 mt-1">
                                <span className="capitalize badge-role-flavor">{displayUser.role}</span>
                                <span>•</span>
                                <span>Joined {displayUser.joined}</span>
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="w-full justify-start mb-6 bg-gray-100 p-1">
                        <TabsTrigger value="details" className="flex-1">Profile Details</TabsTrigger>
                        <TabsTrigger value="products" className="flex-1">Listings {details?.products?.length ? `(${details.products.length})` : ''}</TabsTrigger>
                        <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>{displayUser.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{displayUser.phone || 'No phone provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{displayUser.city || displayUser.location || 'No location provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Shield className="h-4 w-4" />
                                <span className="capitalize">Status: <Badge variant={displayUser.status === 'active' ? 'default' : 'destructive'}>{displayUser.status}</Badge></span>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-medium mb-3">System Metadata</h4>
                            <div className="text-sm text-gray-500 space-y-2">
                                <p>User ID: <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{displayUser.id}</span></p>
                                <p>Last active: {details?.profile?.updatedAt ? formatDistanceToNow(new Date(details.profile.updatedAt), { addSuffix: true }) : (isLoading ? 'Loading...' : 'Unknown')}</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="products">
                        {isLoading ? (
                            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
                        ) : error ? (
                            <div className="text-red-500 text-center py-4">{error}</div>
                        ) : details?.products?.length > 0 ? (
                            <div className="space-y-4">
                                {details.products.map((product: any) => (
                                    <div key={product.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Package className="h-6 w-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.category} • {product.price} PKR</p>
                                        </div>
                                        <Badge variant="outline" className={product.status === 'active' ? 'text-green-600 border-green-200 bg-green-50' : 'text-gray-500'}>
                                            {product.status}
                                        </Badge>
                                    </div>
                                ))}
                                {displayUser.role === 'vendor' && (
                                    <Button variant="link" className="w-full text-teal-600" asChild>
                                        <Link href={`/vendor/${displayUser.id}`} target="_blank">
                                            View Public Storefront <ExternalLink className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No products listed yet.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="activity">
                        {isLoading ? (
                            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
                        ) : details?.activity?.length > 0 ? (
                            <div className="space-y-6">
                                <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                                    {details.activity.map((act: any, idx: number) => (
                                        <div key={idx} className="relative">
                                            <div className={`absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-white ${act.type === 'joined' ? 'bg-green-500' :
                                                act.type === 'product_listing' ? 'bg-blue-500' :
                                                    'bg-gray-400'
                                                }`} />
                                            <p className="text-sm font-medium">{act.title}</p>
                                            <p className="text-xs text-gray-500 mb-1">{act.description}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">
                                                {new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No activity recorded.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}
