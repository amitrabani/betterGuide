import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type SliderColor = 'primary' | 'secondary' | 'accent'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  color?: SliderColor
  label?: string
  showValue?: boolean
  formatValue?: (value: number) => string
}

const colorClasses: Record<SliderColor, string> = {
  primary: 'range-primary',
  secondary: 'range-secondary',
  accent: 'range-accent',
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ color = 'primary', label, showValue, formatValue, className, value, ...props }, ref) => {
    const displayValue = formatValue
      ? formatValue(Number(value))
      : String(value)

    return (
      <div className="form-control w-full">
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-2">
            {label && <span className="label-text">{label}</span>}
            {showValue && (
              <span className="label-text text-primary font-medium">
                {displayValue}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          className={cn('range range-sm', colorClasses[color], className)}
          value={value}
          {...props}
        />
      </div>
    )
  }
)

Slider.displayName = 'Slider'
