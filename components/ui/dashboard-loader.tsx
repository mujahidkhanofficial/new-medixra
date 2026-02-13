'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, ShieldCheck, Database, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface DashboardLoaderProps {
    className?: string
}

export function DashboardLoader({ className }: DashboardLoaderProps) {
    const [progress, setProgress] = useState(0)
    const [messageIndex, setMessageIndex] = useState(0)

    const messages = [
        { text: "Verifying credentials..." },
        { text: "Syncing with database..." },
        { text: "Loading your preferences..." },
        { text: "Preparing dashboard..." }
    ]

    useEffect(() => {
        // Progress bar animation
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress >= 90) {
                    // Slow crawl at the end to show activity
                    return Math.min(oldProgress + 0.5, 98)
                }
                const diff = Math.random() * 20
                const remaining = 90 - oldProgress
                const increment = Math.min(diff, remaining * 0.5)

                return oldProgress + increment
            })
        }, 200)

        // Message rotation
        const messageTimer = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length)
        }, 1500)

        return () => {
            clearInterval(timer)
            clearInterval(messageTimer)
        }
    }, [])

    return (
        <div className={cn("fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm", className)}>
            <div className="w-full max-w-md px-6 flex flex-col items-center">
                {/* Branding - Logo */}
                <div className="mb-12 relative animate-in zoom-in-50 duration-500">
                    <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                    <div className="relative">
                        <Image
                            src="/logo.svg"
                            alt="Medixra"
                            width={150}
                            height={80}
                            className="object-contain drop-shadow-sm"
                        />
                    </div>
                </div>

                {/* Message (No Icon) */}
                <div className="h-8 flex items-center justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                    <p className="text-sm font-medium text-muted-foreground text-center min-w-[200px] animate-pulse">
                        {messages[messageIndex].text}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-xs bg-muted/50 rounded-full h-1 overflow-hidden backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/5">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Footer */}
                <p className="mt-12 text-[10px] font-medium tracking-widest text-muted-foreground/30 uppercase">
                    Secure Connection Encrypted
                </p>
            </div>
        </div>
    )
}
