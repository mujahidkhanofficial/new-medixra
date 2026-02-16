'use client'

import { useState, useTransition } from 'react'
import {
    BarChart3,
    Users,
    Package,
    AlertCircle,
    Eye,
    MessageSquare,
    Trash2,
    CheckCircle,
    XCircle,
    Shield,
    Search,
    LogOut,
    Menu,
    ChevronRight,
    LayoutDashboard,
    UserCheck,
    Flag,
    User,
    MoreHorizontal,
    Copy,
    Ban
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { approveUser, rejectUser, banUser, activateUser } from '@/lib/actions/admin'
import { logout } from '@/lib/actions/auth'
import { resolveReport, dismissReport, deleteReport } from '@/lib/actions/reports'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { AdminCharts } from './components/AdminCharts'
import { ProductManager } from './components/ProductManager'

import { UserDetailSheet } from './components/UserDetailSheet'
import { ActivityFeed } from './components/ActivityFeed'

interface AdminDashboardClientProps {
    initialStats: {
        totalUsers: number
        activeVendors: number
        activeTechnicians: number
        listedProducts: number
        totalInquiries: number
    }
    initialPendingApprovals: any[]
    initialAllUsers: any[]
    initialReportedListings: any[]
    currentAdminId: string
    analyticsData: {
        growthData: any[]
        categoryData: any[]
    }
    activityFeed: any[]
}

export default function AdminDashboardClient({
    initialStats,
    initialPendingApprovals,
    initialAllUsers,
    initialReportedListings,
    currentAdminId,
    analyticsData,
    activityFeed
}: AdminDashboardClientProps) {
    const [activeSection, setActiveSection] = useState('overview')
    const [userSearch, setUserSearch] = useState('')
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isUserSheetOpen, setIsUserSheetOpen] = useState(false)
    const router = useRouter()

    // Local state to reflect optimistic updates
    const [pendingApprovals, setPendingApprovals] = useState(initialPendingApprovals)
    const [allUsers, setAllUsers] = useState(initialAllUsers)
    const [reportedListings, setReportedListings] = useState(initialReportedListings)

    // Handlers
    const handleApproveUser = (userId: string) => {
        startTransition(async () => {
            const result = await approveUser({ userId })
            if (result.success) {
                toast.success('User approved successfully')
                setPendingApprovals(prev => prev.filter(u => u.id !== userId))
            } else {
                toast.error(result.error || 'Failed to approve user')
            }
        })
    }

    const handleRejectUser = (userId: string) => {
        if (!confirm('Are you sure you want to reject this application?')) return
        startTransition(async () => {
            const result = await rejectUser({ userId })
            if (result.success) {
                toast.success('Application rejected')
                setPendingApprovals(prev => prev.filter(u => u.id !== userId))
            } else {
                toast.error(result.error || 'Failed to reject user')
            }
        })
    }

    const handleToggleUserStatus = (userId: string, currentStatus: string, currentRole: string) => {
        if (userId === currentAdminId || currentRole === 'admin') {
            toast.error('Admin account cannot be suspended')
            return
        }

        startTransition(async () => {
            let result;
            if (currentStatus === 'active') {
                if (!confirm('Are you sure you want to suspend this user?')) return
                result = await banUser({ userId })
            } else {
                result = await activateUser({ userId, role: 'user' })
            }

            if (result.success) {
                toast.success(`User ${currentStatus === 'active' ? 'suspended' : 'activated'}`)
                setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status: currentStatus === 'active' ? 'suspended' : 'active' } : u))
            } else {
                toast.error(result.error || 'Action failed')
            }
        })
    }

    const handleResolveReport = (reportId: string, shouldRemove: boolean = false) => {
        startTransition(async () => {
            const result = await resolveReport({
                reportId,
                actionTaken: shouldRemove ? 'listing_removed' : 'vendor_warned',
                shouldRemoveProduct: shouldRemove
            })
            if ('error' in result) {
                toast.error(result.error || 'Failed to resolve report')
            } else {
                toast.success(shouldRemove ? 'Listing removed' : 'Vendor warned')
                setReportedListings(prev => prev.filter(r => r.id !== reportId))
            }
        })
    }

    const handleDismissReport = (reportId: string) => {
        startTransition(async () => {
            const result = await dismissReport({ reportId })
            if ('error' in result) {
                toast.error(result.error || 'Failed to dismiss report')
            } else {
                toast.success('Report dismissed')
                setReportedListings(prev => prev.filter(r => r.id !== reportId))
            }
        })
    }

    const handleDeleteReport = (reportId: string) => {
        if (!confirm('Are you sure you want to delete this report?')) return
        startTransition(async () => {
            const result = await deleteReport({ reportId })
            if ('error' in result) {
                toast.error(result.error || 'Failed to delete report')
            } else {
                toast.success('Report deleted')
                setReportedListings(prev => prev.filter(r => r.id !== reportId))
            }
        })
    }

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await logout()
        } catch (error) {
            console.error('Logout failed:', error)
            toast.error('Logout failed')
            setIsLoggingOut(false)
        }
    }

    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    )



    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'inventory', label: 'All Inventory', icon: Package },
        { id: 'approvals', label: 'Pending Approvals', icon: UserCheck, count: pendingApprovals.length },
        { id: 'users', label: 'All Users', icon: Users },
        { id: 'reports', label: 'Reported Listings', icon: Flag, count: reportedListings.length },
    ]

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 mb-2">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                        <Shield className="h-5 w-5" />
                    </div>
                    <span className="tracking-tight">Medixra</span>
                </h2>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveSection(item.id)
                                setIsMobileMenuOpen(false)
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-teal-50 text-teal-700'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`h-5 w-5 ${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                            </div>
                            {item.count !== undefined && item.count > 0 && (
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isActive
                                    ? 'bg-teal-100/50 text-teal-700'
                                    : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {item.count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </nav>

            <div className="p-4 mt-auto border-t border-gray-50">
                <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    variant="ghost"
                    className="w-full justify-start text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    {isLoggingOut ? 'Logging out...' : 'Sign Out'}
                </Button>
            </div>
        </div>
    )

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[260px] fixed inset-y-0 bg-white border-r border-gray-100">
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 md:pl-[260px] flex flex-col">
                {/* Navbar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-4 md:px-8 justify-between">
                    <div className="flex items-center gap-4">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-[260px]">
                                <SidebarContent />
                            </SheetContent>
                        </Sheet>
                        <div className="flex items-center text-sm text-gray-500 gap-2">
                            <span>Admin</span>
                            <ChevronRight className="h-3 w-3" />
                            <span className="text-gray-900 font-semibold capitalize">{activeSection.replace('-', ' ')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-900">Platform Admin</span>
                            <span className="text-xs text-green-600 font-medium">System Online</span>
                        </div>
                        <Avatar className="h-9 w-9 border border-gray-200">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-teal-100 text-teal-700">
                                <User className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Dashboard Body */}
                <main className="flex-1 p-4 md:p-8">
                    {activeSection === 'overview' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
                                <p className="text-gray-500">Monitor key platform metrics and performance</p>
                            </div>

                            {/* Upgraded Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                {[
                                    { label: 'Total Users', value: initialStats.totalUsers, icon: Users, color: 'text-teal-600' },
                                    { label: 'Active Vendors', value: initialStats.activeVendors, icon: Package, color: 'text-blue-600' },
                                    { label: 'Technicians', value: initialStats.activeTechnicians, icon: Shield, color: 'text-amber-600' },
                                    { label: 'Products', value: initialStats.listedProducts, icon: Eye, color: 'text-purple-600' },
                                    { label: 'Inquiries', value: initialStats.totalInquiries, icon: MessageSquare, color: 'text-emerald-600' },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">{stat.label}</p>
                                            <stat.icon className={`h-5 w-5 ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                                <div className="lg:col-span-2">
                                    <AdminCharts
                                        growthData={analyticsData.growthData}
                                        categoryData={analyticsData.categoryData}
                                    />
                                </div>
                                <div className="lg:col-span-1 h-[500px]">
                                    <ActivityFeed activities={activityFeed} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'inventory' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Inventory Management</h2>
                                <p className="text-sm text-gray-500">Manage all listed products and equipment on the platform</p>
                            </div>
                            <ProductManager />
                        </div>
                    )}

                    {/* User Detail Sheet */}
                    <UserDetailSheet
                        user={selectedUser}
                        isOpen={isUserSheetOpen}
                        onClose={() => setIsUserSheetOpen(false)}
                    />

                    {activeSection === 'users' && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">User Portfolio</h2>
                                    <p className="text-sm text-gray-500">Database of all registered platform members</p>
                                </div>
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or role..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Profile</th>
                                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                                            <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Control</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">{u.name}</span>
                                                        <span className="text-xs text-gray-500 italic">{u.email}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${u.role === 'vendor' ? 'bg-teal-50 text-teal-700' :
                                                        u.role === 'technician' ? 'bg-blue-50 text-blue-700' :
                                                            u.role === 'admin' ? 'bg-red-50 text-red-700' :
                                                                'bg-gray-50 text-gray-600'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`flex items-center gap-1.5 text-xs font-bold ${u.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                                                        {u.status === 'active' ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                                        <span className="capitalize">{u.status}</span>
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-500">{u.joined}</td>
                                                <td className="py-4 px-6 text-right">
                                                    {u.id === currentAdminId || u.role === 'admin' ? (
                                                        <span className="text-xs font-bold text-gray-300">SYSTEM PROTECTED</span>
                                                    ) : (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => {
                                                                    setSelectedUser(u)
                                                                    setIsUserSheetOpen(true)
                                                                }}>
                                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(u.email)}>
                                                                    <Copy className="mr-2 h-4 w-4" /> Copy Email
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className={`${u.status === 'active' ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                                                                    onClick={() => handleToggleUserStatus(u.id, u.status, u.role)}
                                                                    disabled={isPending}
                                                                >
                                                                    {u.status === 'active' ? (
                                                                        <>
                                                                            <Ban className="mr-2 h-4 w-4" /> Suspend
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle className="mr-2 h-4 w-4" /> Activate
                                                                        </>
                                                                    )}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSection === 'approvals' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Application Queue</h2>
                                <p className="text-sm text-gray-500">Verification necessary for high-tier accounts</p>
                            </div>

                            {pendingApprovals.length === 0 ? (
                                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-20 text-center">
                                    <LayoutDashboard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Queue Clear</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto text-sm">No pending applications require your attention right now.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {pendingApprovals.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:border-teal-300 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl">
                                                        {item.name[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{item.name}</h3>
                                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{item.role}</p>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded ring-1 ring-amber-100">PENDING ACTION</span>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Application Segment:</span>
                                                    <span className="text-gray-900 font-bold">{item.equipment}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Origin:</span>
                                                    <span className="text-gray-900 font-bold">{item.location}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Submission Date:</span>
                                                    <span className="text-gray-900 font-bold">{item.appliedDate}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                                                    onClick={() => handleApproveUser(item.id)}
                                                    disabled={isPending}
                                                >
                                                    Approve Access
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="border-gray-200 text-gray-600 hover:bg-gray-50 font-bold"
                                                    onClick={() => handleRejectUser(item.id)}
                                                    disabled={isPending}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'reports' && (
                        <div className="space-y-6 animate-in zoom-in-95 duration-500">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Platform Compliance</h2>
                                <p className="text-sm text-gray-500">Moderate flagging and listing reports from the community</p>
                            </div>

                            {reportedListings.length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
                                    <CheckCircle className="h-14 w-14 text-green-100 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">All Clear</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto text-sm">The platform is currently free of any open community flags.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reportedListings.map((report) => (
                                        <div
                                            key={report.id}
                                            className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col lg:flex-row gap-6"
                                        >
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                                                        <Flag className="h-5 w-5" />
                                                    </div>
                                                    <h3 className="font-bold text-lg text-gray-900">{report.productName}</h3>
                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full uppercase tracking-tighter">Open Flag</span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-4 bg-gray-50 rounded-lg p-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-400 font-bold text-[10px] uppercase">Vendor Info</span>
                                                        <p className="font-bold text-gray-900">{report.vendorName}</p>
                                                        <p className="text-xs text-gray-500">{report.vendorEmail}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 font-bold text-[10px] uppercase">Pricing Check</span>
                                                        <p className="font-bold text-gray-900">{report.productPrice} PKR</p>
                                                    </div>
                                                    <div className="sm:col-span-2 border-t border-gray-200 pt-2 mt-2">
                                                        <span className="text-gray-400 font-bold text-[10px] uppercase">Report Detail: {report.reason.replace(/_/g, ' ')}</span>
                                                        <p className="text-gray-700 mt-1 leading-relaxed">{report.description || 'No detailed description provided.'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:w-48 lg:border-l lg:border-gray-100 lg:pl-6 flex flex-col justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full font-bold text-xs justify-start hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                                                    onClick={() => handleDismissReport(report.id)}
                                                    disabled={isPending}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Seal Legal
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full font-bold text-xs justify-start hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                                                    onClick={() => handleResolveReport(report.id, false)}
                                                    disabled={isPending}
                                                >
                                                    <AlertCircle className="h-4 w-4 mr-2" />
                                                    Warning Shot
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="w-full font-bold text-xs justify-start shadow-sm"
                                                    onClick={() => handleResolveReport(report.id, true)}
                                                    disabled={isPending}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Abolish Post
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
