import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

interface TabsProps {
  defaultTab: string
  className?: string
  children: ReactNode
}

export function Tabs({ defaultTab, className, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('tabs', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabListProps {
  className?: string
  children: ReactNode
}

export function TabList({ className, children }: TabListProps) {
  return (
    <div role="tablist" className={cn('tabs tabs-bordered', className)}>
      {children}
    </div>
  )
}

interface TabTriggerProps {
  value: string
  className?: string
  children: ReactNode
}

export function TabTrigger({ value, className, children }: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext()

  return (
    <button
      role="tab"
      className={cn(
        'tab',
        activeTab === value && 'tab-active',
        className
      )}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

interface TabContentProps {
  value: string
  className?: string
  children: ReactNode
}

export function TabContent({ value, className, children }: TabContentProps) {
  const { activeTab } = useTabsContext()

  if (activeTab !== value) return null

  return <div className={className}>{children}</div>
}
