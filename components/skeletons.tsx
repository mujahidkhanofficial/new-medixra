'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card">
      <Skeleton className="aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  )
}

export function ProductCardGridSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-${columns}`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Gallery */}
      <div className="lg:col-span-8 space-y-4">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function TechnicianCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 max-w-md w-full">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation Skeleton */}
      <div className="border-b border-border bg-card h-16 w-full" />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12 space-y-8">
          {/* Welcome Header */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-96 max-w-full" />
            <Skeleton className="h-6 w-64 max-w-full" />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-6 h-32 flex flex-col justify-between">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>

          {/* Recent Activity & Promo */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6 h-64">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Skeleton className="h-2 w-2 rounded-full mt-2" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </div>
            <Skeleton className="rounded-lg h-64 w-full" />
          </div>
        </div>
      </main>
    </div>
  )
}
