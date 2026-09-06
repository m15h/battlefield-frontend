# Battlefield

A single-page Battleship-style game built with React and [TanStack Query](https://tanstack.com/query). Design battle templates by painting ships onto a grid, then run interactive presentations that track hits, misses, sunk ships, and completion — all persisted to `localStorage` so you can resume a session after a reload.

## Features

- **Template builder** — name a template, pick a color per ship, and paint ships cell-by-cell (with drag-painting) on a 10×10 grid.
- **Presentation player** — a fog-of-war grid where each click resolves to a hit or miss, sunk ships get crossed out, and a completion overlay appears once every ship is destroyed.
- **Dashboard** — list saved templates, start a new presentation from any of them, and resume in-progress sessions.
- **Offline persistence** — templates and presentation state live in `localStorage` via TanStack Query mutations, so progress survives a page reload.

## Commands

To install dependencies:

```bash
bun install
```

To start the development server (http://localhost:3000):

```bash
bun dev
```

To run for production:

```bash
bun start
```

To build a production bundle into `dist/`:

```bash
bun run build:frontend
```

To typecheck:

```bash
bunx tsc --noEmit
```

## Stack

- [Bun](https://bun.com) — runtime, dev server, and bundler
- React 19
- TanStack Query 5 (state + `localStorage` persistence)
- TypeScript
