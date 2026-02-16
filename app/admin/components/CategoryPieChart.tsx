'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface CategoryPieChartProps {
    data: {
        name: string
        value: number
    }[]
}

const COLORS = ['#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5', '#7c3aed']

export function CategoryPieChart({ data }: CategoryPieChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                <p className="text-sm font-medium">No category data available</p>
                <p className="text-xs text-gray-400 mt-1">Product categories will appear here</p>
            </div>
        )
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #E5E7EB" }}
                        itemStyle={{ color: "#374151" }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm text-gray-600 ml-1">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
