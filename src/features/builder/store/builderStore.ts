import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Session, PromptItem, AmbientItem, BinauralConfig, SectionMarker, Lineage } from '@/types/session'
import type { TimelineState, LayerType, HistoryEntry } from '@/types/timeline'
import { defaultTimelineConfig } from '@/types/timeline'

interface BuilderState {
  // Session data
  session: Session | null
  isDirty: boolean

  // Timeline state
  timeline: TimelineState

  // History for undo/redo
  history: {
    past: HistoryEntry[]
    future: HistoryEntry[]
    maxSize: number
  }

  // Actions
  setSession: (session: Session) => void
  createNewSession: (name: string, lineage: Lineage, duration: number) => void
  updateSession: (updates: Partial<Session>) => void
  setDuration: (duration: number) => void

  // Timeline actions
  setZoom: (zoom: number) => void
  setScrollX: (scrollX: number) => void
  setPlayheadPosition: (position: number) => void
  setIsPlaying: (isPlaying: boolean) => void
  selectItem: (itemId: string | null, layerType: LayerType | null) => void

  // Prompt actions
  addPrompt: (prompt: PromptItem) => void
  updatePrompt: (id: string, updates: Partial<PromptItem>) => void
  deletePrompt: (id: string) => void
  movePrompt: (id: string, newStartTime: number) => void

  // Ambient actions
  addAmbient: (ambient: AmbientItem) => void
  updateAmbient: (id: string, updates: Partial<AmbientItem>) => void
  deleteAmbient: (id: string) => void

  // Binaural actions
  setBinaural: (config: BinauralConfig | null) => void
  updateBinaural: (updates: Partial<BinauralConfig>) => void

  // Section actions
  addSection: (section: SectionMarker) => void
  updateSection: (id: string, updates: Partial<SectionMarker>) => void
  deleteSection: (id: string) => void

  // History actions
  undo: () => void
  redo: () => void
  saveToHistory: (description: string) => void
  clearHistory: () => void
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function createEmptySession(name: string, lineage: Lineage, duration: number): Session {
  const now = Date.now()
  return {
    id: generateId(),
    name,
    lineage,
    intent: 'general',
    duration,
    isCanonical: false,
    version: 1,
    prompts: [],
    ambients: [],
    binaural: null,
    sections: [],
    createdAt: now,
    updatedAt: now,
  }
}

export const useBuilderStore = create<BuilderState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    session: null,
    isDirty: false,

    timeline: {
      zoom: defaultTimelineConfig.defaultZoom,
      scrollX: 0,
      scrollY: 0,
      playheadPosition: 0,
      isPlaying: false,
      selectedItemId: null,
      selectedLayerType: null,
    },

    history: {
      past: [],
      future: [],
      maxSize: 50,
    },

    // Session actions
    setSession: (session) => {
      set({ session, isDirty: false })
      get().clearHistory()
    },

    createNewSession: (name, lineage, duration) => {
      const session = createEmptySession(name, lineage, duration)
      set({ session, isDirty: false })
      get().clearHistory()
    },

    updateSession: (updates) => {
      const { session } = get()
      if (!session) return

      set({
        session: { ...session, ...updates, updatedAt: Date.now() },
        isDirty: true,
      })
    },

    setDuration: (duration) => {
      const { session, saveToHistory } = get()
      if (!session) return

      saveToHistory('Change duration')
      set({
        session: { ...session, duration, updatedAt: Date.now() },
        isDirty: true,
      })
    },

    // Timeline actions
    setZoom: (zoom) => {
      const clampedZoom = Math.max(
        defaultTimelineConfig.minZoom,
        Math.min(defaultTimelineConfig.maxZoom, zoom)
      )
      set((state) => ({
        timeline: { ...state.timeline, zoom: clampedZoom },
      }))
    },

    setScrollX: (scrollX) => {
      set((state) => ({
        timeline: { ...state.timeline, scrollX: Math.max(0, scrollX) },
      }))
    },

    setPlayheadPosition: (position) => {
      const { session } = get()
      const maxPosition = session?.duration || 0
      set((state) => ({
        timeline: {
          ...state.timeline,
          playheadPosition: Math.max(0, Math.min(maxPosition, position)),
        },
      }))
    },

    setIsPlaying: (isPlaying) => {
      set((state) => ({
        timeline: { ...state.timeline, isPlaying },
      }))
    },

    selectItem: (itemId, layerType) => {
      set((state) => ({
        timeline: {
          ...state.timeline,
          selectedItemId: itemId,
          selectedLayerType: layerType,
        },
      }))
    },

    // Prompt actions
    addPrompt: (prompt) => {
      const { session, saveToHistory } = get()
      if (!session) return

      saveToHistory('Add prompt')
      set({
        session: {
          ...session,
          prompts: [...session.prompts, prompt],
          updatedAt: Date.now(),
        },
        isDirty: true,
      })
    },

    updatePrompt: (id, updates) => {
      const { session, saveToHistory } = get()
      if (!session) return

      saveToHistory('Update prompt')
      set({
        session: {
          ...session,
          prompts: session.prompts.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          updatedAt: Date.now(),
        },
        isDirty: true,
      })
    },

    deletePrompt: (id) => {
      const { session, saveToHistory } = get()
      if (!session) return

      saveToHistory('Delete prompt')
      set({
        session: {
          ...session,
          prompts: session.prompts.filter((p) => p.id !== id),
          updatedAt: Date.now(),
        },
        isDirty: true,
        timeline: {
          ...get().timeline,
          selectedItemId: null,
          selectedLayerType: null,
        },
      })
    },

    movePrompt: (id, newStartTime) => {
      const { session, saveToHistory } = get()
      if (!session) return

      saveToHistory('Move prompt')
      set({
        session: {
          ...session,
          prompts: session.prompts.map((p) =>
            p.id === id ? { ...p, startTime: Math.max(0, newStartTime) } : p
          ),
          updatedAt: Date.now(),
        },
        isDirty: true,
      })
    },

    // Ambient actions
    addAmbient: (ambient) => {
      const { session, saveToHistory } = get()
      if (!session) return

      saveToHistory('Add ambient')
      set({
        session: {
          ...session,
          ambients: [...session.ambients, ambient],
          updatedAt: Date.now(),
        },
        isDirty: true,
      })
    },

    updateAmbient: (id, updates) => {
      const { session, saveToHistory } = get()
      if (!session) return

      saveToHistory('Update ambient')
      set({
        session: {
          ...session,
          ambients: session.ambients.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
          updatedAt: Date.now(),
        },
        isDirty: true,
      })
    },

    deleteAmbient: (id) => {
      const { session, saveToHistory } = get()
      if (!session) return

      saveToHistory('Delete ambient')
      set({
        session: {
          ...session,
          ambients: session.ambients.filter((a) => a.id !== id),
          updatedAt: Date.now(),
        },
        isDirty: true,
        timeline: {
          ...get().timeline,
          selectedItemId: null,
          selectedLayerType: null,
        },
      })
    },

    // Binaural actions
    setBinaural: (config) => {
      const { session, saveToHistory } = get()
      if (!session) return

      saveToHistory(config ? 'Add binaural' : 'Remove binaural')
      set({
        session: {
          ...session,
          binaural: config,
          updatedAt: Date.now(),
        },
        isDirty: true,
      })
    },

    updateBinaural: (updates) => {
      const { session, saveToHistory } = get()
      if (!session?.binaural) return

      saveToHistory('Update binaural')
      set({
        session: {
          ...session,
          binaural: { ...session.binaural, ...updates },
          updatedAt: Date.now(),
        },
        isDirty: true,
      })
    },

    // Section actions
    addSection: (section) => {
      const { session, saveToHistory } = get()
      if (!session) return

      saveToHistory('Add section')
      set({
        session: {
          ...session,
          sections: [...session.sections, section],
          updatedAt: Date.now(),
        },
        isDirty: true,
      })
    },

    updateSection: (id, updates) => {
      const { session, saveToHistory } = get()
      if (!session) return

      saveToHistory('Update section')
      set({
        session: {
          ...session,
          sections: session.sections.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
          updatedAt: Date.now(),
        },
        isDirty: true,
      })
    },

    deleteSection: (id) => {
      const { session, saveToHistory } = get()
      if (!session) return

      saveToHistory('Delete section')
      set({
        session: {
          ...session,
          sections: session.sections.filter((s) => s.id !== id),
          updatedAt: Date.now(),
        },
        isDirty: true,
      })
    },

    // History actions
    saveToHistory: (description) => {
      const { session, history } = get()
      if (!session) return

      const entry: HistoryEntry = {
        id: generateId(),
        timestamp: Date.now(),
        description,
        snapshot: JSON.parse(JSON.stringify(session)),
      }

      const newPast = [...history.past, entry].slice(-history.maxSize)

      set({
        history: {
          ...history,
          past: newPast,
          future: [], // Clear future on new action
        },
      })
    },

    undo: () => {
      const { session, history } = get()
      if (!session || history.past.length === 0) return

      const previous = history.past[history.past.length - 1]
      const newPast = history.past.slice(0, -1)

      const currentEntry: HistoryEntry = {
        id: generateId(),
        timestamp: Date.now(),
        description: 'Current state',
        snapshot: JSON.parse(JSON.stringify(session)),
      }

      set({
        session: previous.snapshot as Session,
        history: {
          ...history,
          past: newPast,
          future: [currentEntry, ...history.future],
        },
        isDirty: true,
      })
    },

    redo: () => {
      const { session, history } = get()
      if (!session || history.future.length === 0) return

      const next = history.future[0]
      const newFuture = history.future.slice(1)

      const currentEntry: HistoryEntry = {
        id: generateId(),
        timestamp: Date.now(),
        description: 'Current state',
        snapshot: JSON.parse(JSON.stringify(session)),
      }

      set({
        session: next.snapshot as Session,
        history: {
          ...history,
          past: [...history.past, currentEntry],
          future: newFuture,
        },
        isDirty: true,
      })
    },

    clearHistory: () => {
      set((state) => ({
        history: {
          ...state.history,
          past: [],
          future: [],
        },
      }))
    },
  }))
)

// Selectors
export const selectSession = (state: BuilderState) => state.session
export const selectTimeline = (state: BuilderState) => state.timeline
export const selectSelectedItem = (state: BuilderState) => {
  const { session, timeline } = state
  if (!session || !timeline.selectedItemId || !timeline.selectedLayerType) return null

  switch (timeline.selectedLayerType) {
    case 'prompts':
      return session.prompts.find((p) => p.id === timeline.selectedItemId) || null
    case 'ambient':
      return session.ambients.find((a) => a.id === timeline.selectedItemId) || null
    case 'sections':
      return session.sections.find((s) => s.id === timeline.selectedItemId) || null
    case 'binaural':
      return session.binaural
    default:
      return null
  }
}
export const selectCanUndo = (state: BuilderState) => state.history.past.length > 0
export const selectCanRedo = (state: BuilderState) => state.history.future.length > 0
