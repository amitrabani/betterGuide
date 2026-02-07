import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div className={cn('skeleton-shimmer rounded-lg', className)} style={style} />
  )
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-2xl bg-base-200/50 p-6 space-y-4', className)}>
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

export function StatCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-2xl glass-dark border border-white/10 p-6', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

export function FeaturedCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-2xl bg-base-200/50 p-8 space-y-4', className)}>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <div className="flex items-center gap-2 mt-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

const chartBarHeights = [45, 72, 30, 58, 80, 40, 65]

export function ChartSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-2xl glass-dark border border-white/10 p-6', className)}>
      <Skeleton className="h-5 w-32 mb-6" />
      <div className="flex items-end justify-between h-32 gap-2">
        {chartBarHeights.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton
              className="w-full rounded-t"
              style={{ height: `${h}%` }}
            />
            <Skeleton className="h-3 w-6" />
          </div>
        ))}
      </div>
    </div>
  )
}
