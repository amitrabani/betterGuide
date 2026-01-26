interface ExitOverlayProps {
  isVisible: boolean
  progress: number // 0-1
}

export function ExitOverlay({ isVisible, progress }: ExitOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-300/80 backdrop-blur-sm">
      <div className="text-center">
        {/* Progress ring */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-base-content/20"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${progress * 352} 352`}
              strokeLinecap="round"
              className="text-error transition-all"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <p className="text-base-content/80">Hold to exit</p>
        <p className="text-sm text-base-content/60 mt-1">Release to cancel</p>
      </div>
    </div>
  )
}
