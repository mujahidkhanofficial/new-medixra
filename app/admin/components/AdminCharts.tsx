'use client'

import { GrowthChart } from "./GrowthChart"
import { CategoryPieChart } from "./CategoryPieChart"
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react"

interface AdminChartsProps {
    growthData: {
        name: string
        users: number
        products: number
    }[]
    categoryData: {
        name: string
        value: number
    }[]
}

export function AdminCharts({ growthData, categoryData }: AdminChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Chart Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Platform Growth</h3>
                        <p className="text-sm text-gray-500">New users and listings (Last 6 Months)</p>
                    </div>
                    <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </div>
                <GrowthChart data={growthData} />
            </div>

            {/* Category Distribution Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Category Distribution</h3>
                        <p className="text-sm text-gray-500">Top equipment categories by volume</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <PieChartIcon className="h-5 w-5" />
                    </div>
                </div>
                <CategoryPieChart data={categoryData} />
            </div>
        </div>
    )
}
