'use client'

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

interface GrowthChartProps {
    data: {
        name: string
        users: number
        products: number
    }[]
}

export function GrowthChart({ data }: GrowthChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                <p className="text-sm font-medium">No growth data available</p>
                <p className="text-xs text-gray-400 mt-1">Activity over time will appear here</p>
            </div>
        )
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        itemStyle={{ color: "#374151", fontSize: "12px", fontWeight: "600", padding: "2px 0" }}
                        labelStyle={{ color: "#6B7280", marginBottom: "4px", fontSize: "12px" }}
                        cursor={{ stroke: "#9CA3AF", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="users"
                        name="New Users"
                        stroke="#0d9488"
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="products"
                        name="New Listings"
                        stroke="#7c3aed"
                        fillOpacity={1}
                        fill="url(#colorProducts)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
