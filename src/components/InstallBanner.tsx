import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { Button } from '@/components/ui'

export function InstallBanner() {
  const { canInstall, promptInstall } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-base-100 border border-base-300 rounded-lg shadow-lg p-4 z-50 flex items-center gap-4 animate-slide-up">
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Download className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">Install BetterGuide</p>
        <p className="text-xs text-base-content/60">Add to home screen for the best experience</p>
      </div>
      <Button variant="primary" size="sm" onClick={promptInstall}>
        Install
      </Button>
      <button
        className="p-1 hover:bg-base-200 rounded"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-base-content/40" />
      </button>
    </div>
  )
}
