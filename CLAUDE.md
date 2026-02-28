# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HaikuDesign is a monorepo containing a React UI component library (haiku-ui) with Rspress documentation, a Python Flask backend, and an empty CLI placeholder.

## Package Manager

Uses pnpm with workspace configuration. All packages are defined in `pnpm-workspace.yaml`.

## Common Commands

```bash
# Install dependencies
pnpm install

# Lint all code
pnpm lint

# Fix lint issues
pnpm lint:fix
```

### UI Package (packages/ui)

```bash
# Build the UI library
cd packages/ui && pnpm build

# Watch mode for development
cd packages/ui && pnpm dev

# Build CSS in watch mode
cd packages/ui && pnpm dev:css

# Type check
cd packages/ui && pnpm typecheck

# Run tests
cd packages/ui && pnpm test

# Run tests with UI
cd packages/ui && pnpm test:ui

# Run tests with coverage
cd packages/ui && pnpm test:coverage
```

### Documentation (apps/docs)

```bash
# Dev server
cd apps/docs && pnpm dev

# Build for production
cd apps/docs && pnpm build

# Preview production build
cd apps/docs && pnpm preview
```

## Architecture

```
HaikuDesign/
├── apps/
│   ├── backend/        # Python Flask backend (app.py, requirements.txt)
│   ├── docs/          # Rspress documentation site
│   └── shop/          # Empty directory (reserved for future use)
├── packages/
│   ├── cli/           # Empty CLI package placeholder
│   └── ui/            # React UI component library (main package)
└── tsconfig.json      # Root TypeScript config (strict mode, bundler module resolution)
```

### UI Library Structure (packages/ui)

- `src/components/` - React components
- `src/lib/` - Utility functions
- `src/styles/` - CSS/Tailwind styles
- Uses tsup for bundling (ESM + CJS)
- Uses Tailwind CSS v4 with PostCSS

### Documentation

Rspress-based documentation that consumes haiku-ui as a workspace dependency.

### Backend

Simple Flask Python application with file upload functionality.

## Tech Stack

- **UI**: React 19, TypeScript, Tailwind CSS v4, tsup
- **Docs**: Rspress
- **Backend**: Python Flask
- **Linting**: ESLint with typescript-eslint
- **Testing**: Vitest + React Testing Library + jsdom
- **Build**: pnpm workspaces, tsup

## Key Configuration

- `tsconfig.json`: Strict TypeScript with bundler module resolution
- `eslint.config.ts`: ESLint flat config, no-console rule enforced
- React JSX: Uses `react-jsx` transform

## Development Rules

### Dev Server Management

DO NOT actively start dev servers (e.g., `pnpm dev`, `pnpm dev:css`) when verifying the environment or testing changes. Only start them when explicitly requested by the user.

### Documentation Update Required

When adding new features to the UI package (`packages/ui`), you MUST also update the documentation in `apps/docs/docs/components/`:

1. Add a new section in the corresponding `.mdx` file for the component
2. Include a working example using PlayBoard
3. Add the new prop to the API reference table
4. Update `packages/ui/src/components/[Component]/advice/README.md` to mark the feature as completed

This ensures the documentation stays in sync with the component library.
