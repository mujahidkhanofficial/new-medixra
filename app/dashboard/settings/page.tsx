'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, User, Trash2, Edit3, Save } from 'lucide-react'
import { deleteProfile, updateProfile } from '@/lib/actions/auth'
import { toast } from 'sonner'
import { CITIES } from '@/lib/constants'

export default function ProfileSettingsPage() {
    const router = useRouter()
    const { user, profile, loading } = useAuth()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        city: ''
    })

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
        if (profile) {
            setFormData({
                fullName: profile.full_name || '',
                city: profile.city || ''
            })
        }
    }, [user, profile, loading, router])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await updateProfile({
                fullName: formData.fullName,
                city: formData.city
            })
            
            if (result?.success) {
                toast.success('Profile updated successfully')
                setIsEditing(false)
                router.refresh()
            } else {
                toast.error(result?.error || 'Failed to update profile')
            }
        } catch (error) {
            toast.error('An error occurred while updating profile')
            console.error(error)
        } finally {
            setIsSaving(false)
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

            if (result?.success) {
                toast.success('Account deleted successfully')
                setTimeout(() => {
                    router.push('/')
                }, 1000)
            } else {
                toast.error(result?.error || 'Failed to delete account')
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

    // Redirect vendors/technicians to their specific dashboards
    if (profile?.role === 'vendor') {
        router.push('/dashboard/vendor/edit')
        return null
    }

    if (profile?.role === 'technician') {
        router.push('/dashboard/technician/edit')
        return null
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />

            <main className="flex-1 py-12 px-4">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Settings</h1>
                            <p className="text-muted-foreground">View and manage your account settings</p>
                        </div>
                        {!isEditing && (
                            <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                                <Edit3 className="h-4 w-4" />
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Profile Summary / Edit Form */}
                        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border border-border overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-10 w-10 text-primary" />
                                    )}
                                </div>
                                <div>
                                    {isEditing ? (
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Profile Photo</p>
                                            <p className="text-xs text-muted-foreground">Managed via Google/Provider (Coming soon)</p>
                                        </div>
                                    ) : (
                                        <>
                                            <h2 className="text-xl font-semibold">{profile?.full_name || 'User'}</h2>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                            <p className="text-xs text-primary font-semibold mt-1 capitalize">
                                                {profile?.role === 'user' ? 'Individual' : profile?.role}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                        <Input value={user.email || ''} disabled className="bg-muted" />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        {isEditing ? (
                                            <Input 
                                                value={formData.fullName} 
                                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                                placeholder="Enter your name"
                                            />
                                        ) : (
                                            <div className="p-2 border rounded-md bg-muted/20 text-sm h-10 flex items-center">
                                                {profile?.full_name || 'Not set'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">City</label>
                                        {isEditing ? (
                                            <select 
                                                value={formData.city}
                                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
                                                <option value="">Select City</option>
                                                {CITIES.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="p-2 border rounded-md bg-muted/20 text-sm h-10 flex items-center">
                                                {profile?.city || 'Not set'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Danger Zone */}
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
