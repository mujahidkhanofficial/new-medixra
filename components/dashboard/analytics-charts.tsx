'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ViewsChartProps {
  data: Array<{
    date: string
    views: number
    inquiries: number
  }>
}

interface ProductPerformanceChartProps {
  data: Array<{
    name: string
    views: number
    inquiries: number
    conversion: number
  }>
}

export function ViewsChart({ data }: ViewsChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Views"
          />
          <Line
            type="monotone"
            dataKey="inquiries"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="Inquiries"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProductPerformanceChart({ data }: ProductPerformanceChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="views" fill="#3b82f6" name="Views" />
          <Bar dataKey="inquiries" fill="#10b981" name="Inquiries" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
