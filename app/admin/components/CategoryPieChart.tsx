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
        <div className="h-[280px] w-full flex items-center justify-between gap-4">
            {/* Left: The Donut Chart */}
            <div className="w-[45%] h-full shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                borderRadius: "12px",
                                border: "1px solid #E5E7EB",
                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                                maxWidth: "250px",
                                whiteSpace: "normal",
                                wordBreak: "break-word"
                            }}
                            wrapperStyle={{ zIndex: 100 }}
                            itemStyle={{ color: "#374151", fontWeight: 500 }}
                            formatter={(value: number, name: string) => [value, name]}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Right: Custom Scrollable Enterprise Legend */}
            <div className="w-[55%] h-full py-2">
                <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2 custom-scrollbar">
                    {data.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                                <div
                                    className="w-3 h-3 rounded-full shrink-0 mt-0.5 shadow-sm"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-[13px] font-medium text-gray-700 truncate min-w-0" title={entry.name}>
                                    {entry.name}
                                </span>
                            </div>
                            <div className="text-[13px] font-bold text-gray-900 ml-3 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                {entry.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
