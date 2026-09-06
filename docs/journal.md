
# Journal

# Phases

## Phase 1 - basic functionality

**Task 1: Core Type Definitions & TanStack LocalStorage Hook Layer**

* **Goal:** Set up TypeScript interfaces and TanStack Query state persistence over `localStorage`.
* **Files:** `src/types/index.ts`, `src/services/storageService.ts`, `src/hooks/useTemplates.ts`, `src/hooks/usePresentations.ts`
* **Details:**
* Define types: `Coordinate` (`{ x: number, y: number }`), `Ship` (`{ id: string, color: string, coordinates: Coordinate[] }`), `Template` (`{ id: string, name: string, size: number, ships: Ship[] }`), `PresentationCell` (`{ coordinate: Coordinate, state: 'hidden' | 'hit' | 'miss' }`), and `Presentation` (`{ id: string, templateId: string, name: string, grid: PresentationCell[], isFinished: boolean }`).
* In `storageService.ts`, implement synchronous getters/setters interacting with `window.localStorage`.
* Wrap storage methods in TanStack Query hooks using custom query keys (`['templates']`, `['presentations']`) and `queryClient.invalidateQueries` on mutations.



---

**Task 2: Interactive Grid Base Component**

* **Goal:** Create a grid component supporting hover, click, and drag selection states.
* **Files:** `src/components/common/Grid.tsx`
* **Details:**
* Render a CSS Grid based on a dynamic `size` prop (default `10`).
* Implement mouse event listeners (`onMouseDown`, `onMouseEnter`, `onMouseUp`) to track drag painting across multiple cells.
* Expose callback props: `onCellClick(coord: Coordinate)` and `onCellDrag(coords: Coordinate[])`.



---

**Task 3: Template Creator UI**

* **Goal:** Build a screen where users can name templates, select colors, and paint ships on a 10x10 grid.
* **Files:** `src/components/template/TemplateBuilder.tsx`, `src/components/template/ColorPicker.tsx`
* **Details:**
* Add input for `templateName` and a color palette selector for assigning distinct colors to different ships.
* Use `Grid.tsx` to handle cell assignment. Group neighboring or matching-color cells into `Ship` objects.
* Wire up a "Save Template" button that triggers `useSaveTemplate` mutation and redirects/notifies on success.



---

**Task 4: Presentation Engine & Hit Logic**

* **Goal:** Build the interactive presentation player that tracks hits, misses, sunk ships, and completion.
* **Files:** `src/components/presentation/PresentationView.tsx`, `src/utils/gameLogic.ts`
* **Details:**
* On mount, map the chosen template’s grid into a fog-of-war state where all initial cells are `'hidden'`.
* On cell click, calculate outcome: mark cell as `'hit'` if it intersects a ship's coordinate, otherwise mark as `'miss'`.
* Create utility function `checkShipSunk(ship: Ship, hitCells: Coordinate[]): boolean`. If true, apply a crossed-out visual style to all cells belonging to that ship.
* Check if every ship in the template is sunk. If true, set `isFinished: true` and render a completion overlay.
* Persist presentation state changes to `localStorage` via TanStack Query mutation on every turn to support save/resume functionality.



---

**Task 5: Dashboard & Routing Integration**

* **Goal:** Connect all features with a simple view switcher to list templates, start new presentations, and resume saved sessions.
* **Files:** `src/App.tsx`, `src/components/dashboard/Dashboard.tsx`
* **Details:**
* Display a list of saved templates with a "Start Presentation" action button.
* Display a list of active/in-progress presentations fetched via `usePresentations` hook with a "Resume" button.
* Render `TemplateBuilder` when creating a new template and `PresentationView` when playing/resuming a session.

