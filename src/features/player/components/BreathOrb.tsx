import { cn } from '@/lib/utils'

interface BreathOrbProps {
  isPlaying: boolean
  progress: number
  className?: string
}

export function BreathOrb({ isPlaying, progress, className }: BreathOrbProps) {
  // Calculate stroke dasharray for progress ring
  const circumference = 2 * Math.PI * 120 // radius of 120
  const strokeDasharray = `${progress * circumference} ${circumference}`

  return (
    <div className={cn('relative w-64 h-64', className)}>
      {/* Ambient glow behind orb */}
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle, oklch(72% 0.14 195 / 0.15) 0%, transparent 70%)',
          transform: 'scale(1.5)',
          opacity: isPlaying ? 1 : 0,
        }}
      />

      {/* Decorative dashed ring */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{
          animation: isPlaying ? 'spin-slow 30s linear infinite' : 'none',
        }}
      >
        <circle
          cx="128"
          cy="128"
          r="126"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="6 8"
          className="text-white/10"
        />
      </svg>

      {/* Outer ring (progress) */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-white/10"
        />
        {/* Progress circle */}
        <circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="text-primary transition-all duration-300"
        />
      </svg>

      {/* Inner orb with breathing animation */}
      <div
        className="absolute inset-8 rounded-full bg-primary/15 flex items-center justify-center"
        style={{
          animation: isPlaying ? 'breathe 8s ease-in-out infinite' : 'none',
        }}
      >
        <div className="w-32 h-32 rounded-full bg-primary/25 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-full bg-primary/40"
            style={{
              animation: isPlaying ? 'pulse-glow 4s ease-in-out infinite' : 'none',
            }}
          />
        </div>
      </div>
    </div>
  )
}
