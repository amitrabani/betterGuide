import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: ReactNode
  onClick?: () => void
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div className={cn('card bg-base-100 shadow-md', className)} onClick={onClick}>
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
