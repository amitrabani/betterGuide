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
- Tailwind CSS 4 with DaisyUI 5 (custom "lemonade" theme)
- ESLint 9 (flat config format)

## Architecture

- `src/components/` - Reusable UI components
- `src/features/` - Feature-based modules
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities and helpers
- `src/pages/` - Page components
- `src/types/` - TypeScript type definitions

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
