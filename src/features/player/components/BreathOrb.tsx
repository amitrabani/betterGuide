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
          className="text-base-300"
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
        className="absolute inset-8 rounded-full bg-primary/20 flex items-center justify-center"
        style={{
          animation: isPlaying ? 'breathe 8s ease-in-out infinite' : 'none',
        }}
      >
        <div className="w-32 h-32 rounded-full bg-primary/30 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-full bg-primary/50"
            style={{
              animation: isPlaying ? 'pulse-glow 4s ease-in-out infinite' : 'none',
            }}
          />
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px oklch(45% 0.12 175 / 0.3);
          }
          50% {
            box-shadow: 0 0 40px oklch(45% 0.12 175 / 0.5);
          }
        }
      `}</style>
    </div>
  )
}
