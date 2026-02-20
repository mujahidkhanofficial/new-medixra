import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    label: string
    value: string | number
    icon: LucideIcon
    change?: string
    iconColorClass?: string
    iconBgClass?: string
}

export function StatCard({
    label,
    value,
    icon: Icon,
    change,
    iconColorClass = "text-primary",
    iconBgClass = "bg-primary/10"
}: StatCardProps) {
    return (
        <div className="rounded-lg border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <div className={`p-2 rounded-full ${iconBgClass}`}>
                    <Icon className={`h-4 w-4 ${iconColorClass}`} />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">{value}</h3>
                {change && (
                    <span className="text-xs text-primary font-medium">{change}</span>
                )}
            </div>
        </div>
    )
}
