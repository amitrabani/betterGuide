import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Lineage } from '@/types'

type CardVariant = 'default' | 'gradient' | 'glass' | 'featured'

const lineageGradients: Record<Lineage, string> = {
  zazen: 'bg-gradient-to-br from-blue-900/80 to-indigo-900/80',
  mindfulness: 'bg-gradient-to-br from-teal-900/80 to-emerald-900/80',
  'raja-yoga': 'bg-gradient-to-br from-purple-900/80 to-violet-900/80',
  vipassana: 'bg-gradient-to-br from-amber-900/80 to-orange-900/80',
}

const intentRings: Record<string, string> = {
  sleep: 'ring-1 ring-indigo-500/20',
  anxiety: 'ring-1 ring-teal-500/20',
  focus: 'ring-1 ring-amber-500/20',
  energy: 'ring-1 ring-orange-500/20',
}

interface CardProps {
  className?: string
  children: ReactNode
  onClick?: () => void
  variant?: CardVariant
  lineage?: Lineage
  intent?: string
  style?: CSSProperties
}

export function Card({ className, children, onClick, variant = 'default', lineage, intent, style }: CardProps) {
  const variantClasses = {
    default: 'bg-base-200 shadow-md',
    gradient: cn(
      'shadow-lg border border-white/5 hover:shadow-xl hover:border-white/10',
      lineage ? lineageGradients[lineage] : 'bg-gradient-to-br from-base-200 to-base-300',
    ),
    glass: 'glass-dark border border-white/10 shadow-lg',
    featured: cn(
      'shadow-xl border border-white/10',
      lineage ? lineageGradients[lineage] : 'bg-gradient-to-br from-primary/20 to-secondary/20',
    ),
  }

  return (
    <div
      className={cn(
        'card rounded-2xl card-hover-lift relative overflow-hidden',
        variantClasses[variant],
        intent && intentRings[intent],
        className,
      )}
      onClick={onClick}
      style={style}
    >
      {variant === 'featured' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, oklch(100% 0 0 / 0.04) 50%, transparent 100%)',
            animation: 'card-shimmer-sweep 4s ease-in-out infinite',
          }}
        />
      )}
      {children}
    </div>
  )
}

interface CardBodyProps {
  className?: string
  children: ReactNode
}

export function CardBody({ className, children }: CardBodyProps) {
  return <div className={cn('card-body', className)}>{children}</div>
}

interface CardTitleProps {
  className?: string
  children: ReactNode
}

export function CardTitle({ className, children }: CardTitleProps) {
  return <h2 className={cn('card-title', className)}>{children}</h2>
}

interface CardActionsProps {
  className?: string
  children: ReactNode
}

export function CardActions({ className, children }: CardActionsProps) {
  return <div className={cn('card-actions justify-end', className)}>{children}</div>
}
