'use client'

import { useState, useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/actions/notifications'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

export function NotificationBell() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const loadNotifications = async () => {
        if (!user) return
        const res = await getNotifications({})
        if (res?.data) {
            setNotifications(res.data.notifications)
            setUnreadCount(res.data.unreadCount)
        }
    }

    // Poll for notifications every 60 seconds
    useEffect(() => {
        loadNotifications()
        const interval = setInterval(loadNotifications, 60000)
        return () => clearInterval(interval)
    }, [user])

    const handleMarkAsRead = async (id: string, link?: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))

        await markNotificationAsRead({ notificationId: id })

        if (link) {
            router.push(link)
            setIsOpen(false)
        }
    }

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
        await markAllNotificationsAsRead({})
    }

    if (!user) return null

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto px-2 text-xs text-primary" onClick={handleMarkAllRead}>
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`flex flex-col gap-1 border-b px-4 py-3 text-sm transition-colors hover:bg-muted/50 ${!notification.isRead ? 'bg-muted/20' : ''}`}
                                onClick={() => handleMarkAsRead(notification.id, notification.link)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {notification.title}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-muted-foreground line-clamp-2">
                                    {notification.message}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
