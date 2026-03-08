'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CommunityMessageWithUser, postMessage } from '@/lib/actions/community'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, MessageSquareQuote } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface CommunityFeedProps {
    initialMessages: CommunityMessageWithUser[]
    currentUser: any | null
}

export default function CommunityFeed({ initialMessages, currentUser }: CommunityFeedProps) {
    const [messages, setMessages] = useState<CommunityMessageWithUser[]>(initialMessages)
    const [content, setContent] = useState('')
    const [isPending, startTransition] = useTransition()
    const [replyTo, setReplyTo] = useState<CommunityMessageWithUser | null>(null)
    const endOfMessagesRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Auto-scroll to bottom on new messages
    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // Scroll to bottom purely on initial mount
    useEffect(() => {
        const timer = setTimeout(() => scrollToBottom(), 100)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        // Hydrate from WebSockets
        const channel = supabase.channel('public:community_messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'community_messages'
            }, async (payload) => {
                const newMessage = payload.new as any

                // Realtime only gives us the row data, we need the Profile join to draw UI
                // We fetch the profile securely
                const { data: userData } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, role')
                    .eq('id', newMessage.user_id)
                    .single()

                if (userData) {
                    const completeMessage: CommunityMessageWithUser = {
                        id: newMessage.id,
                        content: newMessage.content,
                        createdAt: newMessage.created_at,
                        replyToId: newMessage.reply_to_id,
                        user: {
                            id: userData.id,
                            fullName: userData.full_name,
                            avatarUrl: userData.avatar_url,
                            role: userData.role
                        }
                    }

                    setMessages(prev => {
                        // Deduplicate in case this message was already optimistically inserted
                        if (prev.some(m => m.id === completeMessage.id)) {
                            return prev.map(m => m.id === completeMessage.id ? completeMessage : m)
                        }
                        return [...prev, completeMessage]
                    })
                    scrollToBottom()
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentUser) {
            toast.error("Please sign in to post a message.")
            return
        }

        const payloadContent = content.trim()
        if (!payloadContent) return

        const payloadReplyTo = replyTo
        const optimisticId = crypto.randomUUID()

        // 1. Optimistic DOM Update
        const optimisticMsg: CommunityMessageWithUser = {
            id: optimisticId,
            content: payloadContent,
            createdAt: new Date().toISOString(),
            replyToId: payloadReplyTo?.id || null,
            user: {
                id: currentUser.id,
                fullName: currentUser.user_metadata?.full_name || currentUser.email || 'You',
                avatarUrl: currentUser.user_metadata?.avatar_url || null,
                role: currentUser.user_metadata?.role || null
            }
        }

        setMessages(prev => [...prev, optimisticMsg])
        setContent('')
        setReplyTo(null)
        setTimeout(() => scrollToBottom(), 50)

        // 2. Background Sync
        startTransition(async () => {
            const result = await postMessage(payloadContent, payloadReplyTo?.id, optimisticId)

            if (!result.success) {
                // Revert if the server rejects it (e.g. rate limit, auth error)
                setMessages(prev => prev.filter(m => m.id !== optimisticId))
                setContent(payloadContent)
                setReplyTo(payloadReplyTo)
                toast.error(result.error)
            }
        })
    }

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const getInitials = (name?: string | null) => name ? name[0].toUpperCase() : 'U'

    return (
        <div className="flex flex-col h-full">
            {/* Chat History View */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 flex flex-col">
                {messages.length === 0 ? (
                    <div className="m-auto text-center flex flex-col items-center justify-center p-12 max-w-sm">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                            <MessageSquareQuote className="h-8 w-8 text-gray-400/80" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Live Community Feed</h3>
                        <p className="text-gray-500 mt-2.5 text-[15px] leading-relaxed">It's quiet here. Be the first to broadcast a message to the network.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = currentUser?.id === msg.user.id
                        const quotedMsg = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null

                        return (
                            <div key={msg.id} className={`flex max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                {/* Avatar */}
                                <Link href={`/profile/${msg.user.id}`} className="flex-shrink-0 mt-auto mb-1 group">
                                    <div className="h-[38px] w-[38px] rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-semibold border border-gray-200/60 shadow-sm overflow-hidden transform group-hover:scale-105 transition-all">
                                        {msg.user.avatarUrl ? (
                                            <img src={msg.user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : getInitials(msg.user.fullName)}
                                    </div>
                                </Link>

                                {/* Message Bubble Container */}
                                <div className={`flex flex-col mx-3 group ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1.5 px-1">
                                        <span className="text-[13px] font-medium text-gray-900">{isMe ? 'You' : (msg.user.fullName || 'Unknown User')}</span>
                                        {msg.user.role && (
                                            <span className="text-[10px] uppercase font-bold tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200/60">
                                                {msg.user.role}
                                            </span>
                                        )}
                                        <span className="text-[11px] font-medium text-gray-400">
                                            {isMounted ? formatTime(msg.createdAt) : ''}
                                        </span>
                                    </div>

                                    {quotedMsg && (
                                        <div className={`mb-1.5 px-3 py-2.5 rounded-xl text-[13px] border-l-[3px] opacity-90 max-w-full truncate ${isMe ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                            <span className="font-semibold mr-2">{quotedMsg.user.fullName}:</span>
                                            {quotedMsg.content}
                                        </div>
                                    )}

                                    <div className={`relative px-5 py-3 text-[15px] leading-relaxed break-words shadow-sm max-w-full
                                        ${isMe
                                            ? 'bg-gray-900 text-white rounded-[22px] rounded-br-[4px]'
                                            : 'bg-white border text-gray-800 rounded-[22px] rounded-bl-[4px]'}`}
                                    >
                                        {msg.content}
                                    </div>

                                    {!isMe && currentUser && (
                                        <button
                                            onClick={() => setReplyTo(msg)}
                                            className="text-[11px] font-semibold text-gray-400 mt-1.5 opacity-0 group-hover:opacity-100 hover:text-gray-900 transition-all px-1"
                                        >
                                            Reply
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={endOfMessagesRef} className="h-4" />
            </div>

            {/* Composer View */}
            <div className="bg-white px-4 sm:px-6 py-5 border-t border-gray-100">
                <div className="max-w-4xl mx-auto relative">
                    {replyTo && (
                        <div className="absolute bottom-full left-0 mb-3 px-4 py-2.5 bg-gray-900 shadow-lg text-white rounded-xl flex items-center justify-between text-[13px] w-full max-w-md animate-in slide-in-from-bottom-2">
                            <div className="flex-1 truncate pr-4 opacity-90">
                                <span className="font-semibold text-gray-300 mr-2">Replying to {replyTo.user.fullName}:</span>
                                <span className="text-gray-100">{replyTo.content}</span>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white transition-colors p-1">
                                ✕
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="relative flex items-end gap-3 rounded-[24px] bg-gray-50 border border-gray-200/80 p-1.5 focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-300 transition-all shadow-sm">
                        <Textarea
                            placeholder={currentUser ? "Message community..." : "Sign in to send a message..."}
                            className="resize-none min-h-[44px] max-h-[160px] bg-transparent border-0 focus-visible:ring-0 py-3 px-4 text-[15px] text-gray-900 placeholder:text-gray-400 shadow-none w-full"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSubmit(e)
                                }
                            }}
                            disabled={!currentUser || isPending}
                            rows={content.split('\n').length > 1 ? Math.min(content.split('\n').length, 5) : 1}
                        />

                        <Button
                            type="submit"
                            size="icon"
                            disabled={!content.trim() || !currentUser || isPending}
                            className="shrink-0 rounded-full h-11 w-11 bg-gray-900 hover:bg-black text-white disabled:opacity-40 transition-all shadow-sm mb-0.5 mr-0.5"
                        >
                            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-[18px] w-[18px] ml-0.5" />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
