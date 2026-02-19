'use client'

import { useState, useEffect } from 'react'
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
import { Mail, Phone, MapPin, Calendar, Shield, Package, Clock, ExternalLink, Loader2 } from "lucide-react"
import Link from 'next/link'
import { getUserActivityAndProducts } from '@/lib/actions/admin'
import { formatDistanceToNow } from 'date-fns'

interface UserDetailSheetProps {
    user: any | null
    isOpen: boolean
    onClose: () => void
}

export function UserDetailSheet({ user, isOpen, onClose }: UserDetailSheetProps) {
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

    if (!user) return null

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-gray-100">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className="text-xl bg-teal-100 text-teal-700">
                                {user.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <SheetTitle className="text-2xl font-bold">{user.name}</SheetTitle>
                            <SheetDescription className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${user.role === 'vendor' ? 'bg-teal-50 text-teal-700 ring-teal-600/20' :
                                    user.role === 'technician' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                                        'bg-gray-50 text-gray-600 ring-gray-500/10'
                                    }`}>
                                    {user.role.toUpperCase()}
                                </span>
                                <span>•</span>
                                <span>Joined {user.joined}</span>
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start mb-6 bg-gray-100 p-1">
                        <TabsTrigger value="details" className="flex-1">Profile Details</TabsTrigger>
                        <TabsTrigger value="products" className="flex-1">Listings ({products.length})</TabsTrigger>
                        <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                        <div className="space-y-4">
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
                            </div>
                        </div>

                        <Separator />

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
                            </div>
                        </div>
                    </TabsContent>

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
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
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
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="activity">
                        {isLoading ? (
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}

