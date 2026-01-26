# BetterGuide

React + TypeScript + Vite application with Tailwind CSS and DaisyUI.

## Tech Stack

- React 19 with TypeScript
- Vite 7
- Tailwind CSS 4 with DaisyUI 5
- ESLint 9

## Getting Started

```bash
npm install
npm run dev
```

## Commands

```bash
npm run dev       # Start development server
npm run build     # TypeScript check + production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Project Structure

```
src/
  components/     # Reusable UI components
  features/       # Feature-based modules
  hooks/          # Custom React hooks
  lib/            # Utilities and helpers
  pages/          # Page components
  types/          # TypeScript type definitions
```

## Path Aliases

Use `@/` to import from `src/`:

```tsx
import { cn } from '@/lib/utils'
```
