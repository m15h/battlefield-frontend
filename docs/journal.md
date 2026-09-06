
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

### Phase 1 Status

Done

## Phase 2 - polishing

When creating template:
1. Currently we have `Save & start` and `Cancel` buttons. Please add `Save` which will save template and go back to dashboard.
2. Grid should have headers for columns and rows. Column headers should be letters starting from `A`. Row headers hould be numbers starting from `1`.
3. After creating each object/ship, change color to the next one from ColorPicker. If already last color is chosen, go back to the first color.
4. Singular grid cells should highligh on hover whith it's column and line header.
5. Whole objects/ships should highligh on hover.
6. When drawing object/ship while dragging, object should be drawn live.
   1. When drawing object, if cursor is going back it's footsteps, it should remove from object the cells it stepped off of.
7. Objects can touch each other but shouldn't overlap. When drawing object, object should be extended only into cell not belonging to other object and touching cell already belonging to object that is currently being drawn.
8. Dimensions of the battlefield should be defineable. From 1x1 to 99x99.
   1. Number of rows and columns should be defineable independently.
   2. Dimensions should be changeable at all times up until template is saved.

During presentation:
1. Singular grid cells should highligh on hover whith it's column and line header.
2. Currenty, summary just under the template name there is summary "X ships  Y hits  Z sunk" and the X Y Z numbers reflect number or grid cells.
   1. Instead of `ships` call them `objects`.
   2. Instead of `sunk` call them `destroyed`.
   3. For number of `objects` and `destroyed`, count number of objects, not cells it's composed of.
   4. Number of `hits` is correct.
   5. Display also number of `misses` (missed shots)

General changes:
1. Don't use `windows.confirm` nor `window.alert`. Create dedicated modal for this which will be displayed in the middle and page in the back would be dimmed. Pressing outside the modal should be treated as 'Cancel'.
2. Templates displayed on dashboard: save and display date of creation (displayed in local timezone and format).
3. Presentations (dashboard list and during presentation): save and display `startedAt`, `lastUpdatedAt` and `finishedAt` dates.
4. For each template, number of ongoing and number of finished presentiations should be stored and displayed.
5. Ability to export and import state of application to/from json file. 

### Phase 2 Status

Backlog
