<<<<<<< HEAD
import { useState, useEffect, useTransition } from 'react'
=======
'use client'

import { useState, useEffect } from 'react'
>>>>>>> a4b0799
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
<<<<<<< HEAD
import { Mail, Phone, MapPin, Calendar, Shield, Package, Clock, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import Link from 'next/link'
import { getUserDetails } from '@/lib/actions/admin'
=======
import { Mail, Phone, MapPin, Calendar, Shield, Package, Clock, ExternalLink, Loader2 } from "lucide-react"
import Link from 'next/link'
import { getUserActivityAndProducts } from '@/lib/actions/admin'
>>>>>>> a4b0799
import { formatDistanceToNow } from 'date-fns'

interface UserDetailSheetProps {
    user: any | null
    isOpen: boolean
    onClose: () => void
}

export function UserDetailSheet({ user, isOpen, onClose }: UserDetailSheetProps) {
<<<<<<< HEAD
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
=======
    const [activeTab, setActiveTab] = useState('details')
    const [products, setProducts] = useState<any[]>([])
    const [activities, setActivities] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (user && isOpen) {
            const fetchData = async () => {
                setIsLoading(true)
                try {
                    const data = await getUserActivityAndProducts(user.id)
                    setProducts(data.products)
                    setActivities(data.activities)
                } catch (error) {
                    console.error('Failed to fetch user details:', error)
                } finally {
                    setIsLoading(false)
                }
            }
            fetchData()
        } else {
            // Reset state when closed
            setProducts([])
            setActivities([])
            setActiveTab('details')
        }
    }, [user, isOpen])
>>>>>>> a4b0799

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
<<<<<<< HEAD
                                <span className="capitalize badge-role-flavor">{displayUser.role}</span>
=======
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${user.role === 'vendor' ? 'bg-teal-50 text-teal-700 ring-teal-600/20' :
                                    user.role === 'technician' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                                        'bg-gray-50 text-gray-600 ring-gray-500/10'
                                    }`}>
                                    {user.role.toUpperCase()}
                                </span>
>>>>>>> a4b0799
                                <span>•</span>
                                <span>Joined {displayUser.joined}</span>
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start mb-6 bg-gray-100 p-1">
                        <TabsTrigger value="details" className="flex-1">Profile Details</TabsTrigger>
<<<<<<< HEAD
                        <TabsTrigger value="products" className="flex-1">Listings {details?.products?.length ? `(${details.products.length})` : ''}</TabsTrigger>
=======
                        <TabsTrigger value="products" className="flex-1">Listings ({products.length})</TabsTrigger>
>>>>>>> a4b0799
                        <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                        <div className="space-y-4">
<<<<<<< HEAD
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
=======
                            <div className="flex items-center gap-3 text-gray-600 group hover:text-gray-900 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 group hover:text-gray-900 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{user.phone || 'No phone provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 group hover:text-gray-900 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{user.location || 'No location provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 group hover:text-gray-900 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <span className="capitalize font-medium">Status: <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="ml-2">{user.status}</Badge></span>
>>>>>>> a4b0799
                            </div>
                        </div>

                        <Separator />

<<<<<<< HEAD
                        <div>
                            <h4 className="font-medium mb-3">System Metadata</h4>
                            <div className="text-sm text-gray-500 space-y-2">
                                <p>User ID: <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{displayUser.id}</span></p>
                                <p>Last active: {details?.profile?.updatedAt ? formatDistanceToNow(new Date(details.profile.updatedAt), { addSuffix: true }) : (isLoading ? 'Loading...' : 'Unknown')}</p>
=======
                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">System Metadata</h4>
                            <div className="text-sm text-gray-500 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span>User ID</span>
                                    <span className="font-mono text-xs bg-white border border-gray-200 px-2 py-1 rounded shadow-sm select-all">{user.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Last Active</span>
                                    <span className="font-bold text-gray-700">
                                        {/* Since we don't have exact last_sign_in_at, we can infer from activity or show 'Unknown' cleanly */}
                                        {activities.length > 0 ? formatDistanceToNow(new Date(activities[0].timestamp), { addSuffix: true }) : 'Unknown'}
                                    </span>
                                </div>
>>>>>>> a4b0799
                            </div>
                        </div>
                    </TabsContent>

<<<<<<< HEAD
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
=======
                    <TabsContent value="products" className="animate-in slide-in-from-right-4 duration-300">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p className="font-medium">No listings found for this user.</p>
                                {user.role === 'vendor' && (
                                    <Button variant="link" className="mt-2 text-teal-600" asChild>
                                        <Link href={`/vendor/${user.id}`} target="_blank">
                                            Visit Vendor Storefront <ExternalLink className="ml-1 h-3 w-3" />
>>>>>>> a4b0799
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
<<<<<<< HEAD
                            <div className="text-center py-8 text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No products listed yet.</p>
=======
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-gray-900">Active Listings</h3>
                                    <Link href={`/vendor/${user.id}`} target="_blank" className="text-xs text-teal-600 hover:underline flex items-center">
                                        View All <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                </div>
                                <div className="grid gap-3">
                                    {products.map((product) => (
                                        <div key={product.id} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-all group">
                                            <div className="h-12 w-12 bg-gray-100 rounded-md shrink-0 overflow-hidden">
                                                {product.imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={JSON.parse(product.imageUrl)[0]} alt={product.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                        <Package className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate group-hover:text-teal-600 transition-colors">{product.name}</h4>
                                                <p className="text-xs text-gray-500 truncate">{product.category} • {product.price} PKR</p>
                                            </div>
                                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                                                {product.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
>>>>>>> a4b0799
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="activity">
                        {isLoading ? (
<<<<<<< HEAD
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
=======
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="relative pl-6 border-l-2 border-gray-100 space-y-8 py-2">
                                    {activities.map((activity, index) => (
                                        <div key={index} className="relative group">
                                            <div className={`absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-white ring-2 ring-transparent transition-all group-hover:scale-125 ${activity.type === 'account_created' ? 'bg-green-500 ring-green-100' :
                                                activity.type === 'product_listed' ? 'bg-blue-500 ring-blue-100' :
                                                    activity.type === 'profile_updated' ? 'bg-orange-500 ring-orange-100' :
                                                        'bg-gray-400'
                                                }`} />
                                            <p className="text-sm font-bold text-gray-900">{activity.title}</p>
                                            <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>
                                            <p className="text-xs text-gray-400 mt-1 font-medium">{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</p>
>>>>>>> a4b0799
                                        </div>
                                    ))}
                                </div>
                            </div>
<<<<<<< HEAD
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No activity recorded.</p>
                            </div>
=======
>>>>>>> a4b0799
                        )}
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}

