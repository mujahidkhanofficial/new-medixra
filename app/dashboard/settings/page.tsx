'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, User, Trash2, Edit3 } from 'lucide-react'
import { deleteProfile } from '@/lib/actions/auth'
import { toast } from 'sonner'

export default function ProfileSettingsPage() {
    const router = useRouter()
    const { user, profile, loading } = useAuth()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    const handleSave = async () => {
        if (profile?.role === 'vendor') {
            router.push('/dashboard/vendor/edit')
        } else if (profile?.role === 'technician') {
            router.push('/dashboard/technician/edit')
        }
    }

    const handleDeleteProfile = async () => {
        if (deleteConfirmation !== 'DELETE') {
            toast.error('Please type DELETE to confirm')
            return
        }

        setIsDeleting(true)
        try {
            const result = await deleteProfile({ confirmation: 'DELETE' })

            if (result.success) {
                toast.success('Account deleted successfully')
                // Redirect to home after a short delay
                setTimeout(() => {
                    router.push('/')
                }, 1000)
            } else {
                toast.error(result.error || 'Failed to delete account')
            }
        } catch (error) {
            toast.error('An error occurred while deleting your account')
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) return null

    // Redirect based on role
    if (profile?.role === 'vendor') {
        router.push('/dashboard/vendor/edit')
        return null
    }

    if (profile?.role === 'technician') {
        router.push('/dashboard/technician/edit')
        return null
    }

    // Regular user profile view
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />

            <main className="flex-1 py-12 px-4">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted-foreground">View and manage your account settings</p>
                    </div>

                    <div className="space-y-4">
                        {/* Profile Summary Card */}
                        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        <User className="h-10 w-10 text-primary" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold">{profile?.full_name || 'User'}</h2>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="text-xs text-primary font-semibold mt-1 capitalize">
                                        {profile?.role === 'user' ? 'Individual' : profile?.role || 'Individual'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Settings Options */}
                        <div className="space-y-3">
                            <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                                <h3 className="font-semibold text-sm mb-1">Account Information</h3>
                                <p className="text-xs text-muted-foreground mb-3">Email, name, and basic profile details</p>
                                <div className="space-y-2 text-sm mb-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span>{user.email}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span>{profile?.full_name || <span className="text-muted-foreground">Not set</span>}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">City:</span>
                                        <span>{profile?.city || <span className="text-muted-foreground">Not set</span>}</span>
                                    </div>

                                    <div className="pt-3 flex justify-end">
                                        <Link href="/dashboard/user" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                                            <Edit3 className="h-4 w-4" />
                                            Edit profile
                                        </Link>
                                    </div>
                                </div>
                            </div>



                            {/* Danger Zone - Delete Account */}
                            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mt-6">
                                <h3 className="font-semibold text-sm text-destructive mb-1 flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Danger Zone
                                </h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteDialog(true)}
                                    disabled={isDeleting || profile?.role === 'admin'}
                                    title={profile?.role === 'admin' ? "Admin accounts cannot be deleted" : ""}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Account
                                        </>
                                    )}
                                </Button>
                                {profile?.role === 'admin' && (
                                    <p className="text-[10px] text-destructive mt-2 font-medium">
                                        Admin accounts cannot be deleted for security reasons.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive">Delete Account Permanently</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4 pt-4">
                            <div>
                                <p className="text-sm font-medium text-foreground mb-2">This will:</p>
                                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                    <li>Remove your profile and personal data</li>
                                    <li>Delete all your products and listings</li>
                                    <li>Remove all saved items</li>
                                    <li>Delete your account permanently</li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground mb-2">To confirm, type: <span className="font-mono font-bold text-destructive">DELETE</span></p>
                                <input
                                    type="text"
                                    placeholder="Type DELETE to confirm"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProfile}
                            disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Account'
                            )}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
            <Footer />
        </div>
    )
}
