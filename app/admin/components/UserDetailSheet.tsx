'use client'

import { useState } from 'react'
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
import { Mail, Phone, MapPin, Calendar, Shield, Package, Clock, ExternalLink } from "lucide-react"
import Link from 'next/link'

interface UserDetailSheetProps {
    user: any | null
    isOpen: boolean
    onClose: () => void
}

export function UserDetailSheet({ user, isOpen, onClose }: UserDetailSheetProps) {
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
                                <span className="capitalize">{user.role}</span>
                                <span>•</span>
                                <span>Joined {user.joined}</span>
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="w-full justify-start mb-6 bg-gray-100 p-1">
                        <TabsTrigger value="details" className="flex-1">Profile Details</TabsTrigger>
                        <TabsTrigger value="products" className="flex-1">Listings</TabsTrigger>
                        <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{user.phone || 'No phone provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{user.location || 'No location provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Shield className="h-4 w-4" />
                                <span className="capitalize">Status: <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>{user.status}</Badge></span>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-medium mb-3">System Metadata</h4>
                            <div className="text-sm text-gray-500 space-y-2">
                                <p>User ID: <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{user.id}</span></p>
                                <p>Last active: Just now</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="products">
                        <div className="text-center py-8 text-gray-500">
                            <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Product listing integration coming soon.</p>
                            <Button variant="link" className="mt-2 text-teal-600" asChild>
                                <Link href={`/vendor/${user.id}`} target="_blank">
                                    View Public Storefront <ExternalLink className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="activity">
                        <div className="space-y-6">
                            <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                                <div className="relative">
                                    <div className="absolute -left-[29px] top-1 bg-green-500 h-3 w-3 rounded-full border-2 border-white" />
                                    <p className="text-sm font-medium">Account Created</p>
                                    <p className="text-xs text-gray-500">{user.joined}</p>
                                </div>
                                {/* Mock activity for now */}
                                <div className="relative">
                                    <div className="absolute -left-[29px] top-1 bg-blue-500 h-3 w-3 rounded-full border-2 border-white" />
                                    <p className="text-sm font-medium">Verified Email</p>
                                    <p className="text-xs text-gray-500">{user.joined}</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}
