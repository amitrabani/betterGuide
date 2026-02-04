# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server with HMR
npm run build     # TypeScript check + production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Tech Stack

- React 19 with TypeScript (~5.9)
- Vite 7 with Babel for Fast Refresh
- Tailwind CSS 4 with DaisyUI 5 (custom "sweetcrush" theme)
- ESLint 9 (flat config format)

## Architecture

### Core Domain

This is a meditation session builder PWA. A `Session` (`src/types/session.ts`) contains:
- `prompts` - Timed spoken instructions with TTS config
- `ambients` - Background audio layers with fade in/out
- `binaural` - Optional binaural beat configuration
- `sections` - Structural markers (opening/main/closing)

### Key Patterns

- **State Management**: Zustand stores in `src/features/*/store/` with `subscribeWithSelector` middleware
- **Persistence**: IndexedDB via `idb` library (`src/services/persistence/db.ts`)
- **Audio**: Web Audio API engine in `src/audio/engine/AudioEngine.ts`
- **Routing**: React Router v7 with lazy-loaded pages (`src/app/Router.tsx`)

### Feature Modules

- `src/features/builder/` - Timeline-based session editor with undo/redo history
- `src/features/player/` - Fullscreen meditation playback with wake lock

## Path Aliases

Use `@/` prefix to import from `src/`:
```tsx
import { cn } from '@/lib/utils'
```

## Styling

- Use Tailwind CSS utility classes
- Use DaisyUI components (btn, card, modal, etc.)
- Use `cn()` utility from `@/lib/utils` for conditional class merging
- Theme colors defined in `src/index.css` using DaisyUI theme plugin
