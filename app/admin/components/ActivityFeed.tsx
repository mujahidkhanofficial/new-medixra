'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, PackagePlus, ShieldCheck, AlertCircle } from "lucide-react"

export interface ActivityItem {
    id: string
    type: 'user_join' | 'product_list' | 'vendor_verify' | 'report'
    title: string
    description: string
    timestamp: Date
    user?: {
        name: string
        image?: string
    }
}

interface ActivityFeedProps {
    activities: ActivityItem[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'user_join': return <UserPlus className="h-4 w-4 text-blue-500" />
            case 'product_list': return <PackagePlus className="h-4 w-4 text-purple-500" />
            case 'vendor_verify': return <ShieldCheck className="h-4 w-4 text-green-500" />
            case 'report': return <AlertCircle className="h-4 w-4 text-red-500" />
            default: return <UserPlus className="h-4 w-4 text-gray-500" />
        }
    }

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            </div>
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                    {activities.length === 0 ? (
                        <p className="text-gray-500 text-center text-sm">No recent activity</p>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex gap-4">
                                <div className="mt-1">
                                    <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                        {getIcon(activity.type)}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                        <span className="text-xs text-gray-500">{formatTime(activity.timestamp)}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{activity.description}</p>
                                    {activity.user && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage src={activity.user.image} />
                                                <AvatarFallback className="text-[10px]">{activity.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-gray-400">{activity.user.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
