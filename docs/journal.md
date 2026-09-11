
# Journal

# Phases

## Phase 1 - basic functionality

### Requirements

Battlefield-frontend is not a game, but more like presentation tool.

The overview usage:
1. Person defines battlefield templates for later use.
2. Person starts new presentation from template.
3. Presentation state can be saved and resumed later.

Template requirements:
1. Template has a name.
2. Template is two dimensional field composed of squares.
3. Default template size is 10x10.
4. Person creates objects/ships on template by clicking or dragging cursor over fields.
5. For readability sake, when defining template, objects should be colored in different colors.
6. Objects can stand on neighbouring fields.
7. After saving template, it can be used to start game/presentation.

Presentation:
1. Presentation shows blank battlefield.
2. Person clicks squares on battlefield and Tool shows if it was hit or miss.
3. If every square of ship/object was hit, the object gets crossed out.
4. If every ship/object was destroyed/crossed out, presentation is finished.

Implementation details:
1. We're using bunjs to run and bundle this project.
2. All source code should be placed in `./src/`.
3. Use tanstack query, but save and load data in local storage (or any frontend side storage).
4. Try to keep code clean and neatly divided into subdirectories and components.

### Tasks

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

Done on days 2026-06-08 and 2026-06-09.

## Phase 2 - polishing

### Action Items

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

### Tasks

**Task 6a: Core Type Definition Updates**

* **Goal:** Expand TypeScript interfaces with dynamic dimensions and timestamp tracking.
* **Files:** `src/types/index.ts`
* **Details:**
* Update `Template` to include `createdAt: string`, `width: number`, and `height: number`.
* Update `Presentation` to include `startedAt: string`, `lastUpdatedAt: string`, and optional `finishedAt?: string`.


---

**Task 6b: Backup & Storage Service Extensions**

* **Goal:** Add JSON import/export functions and presentation metrics helpers to the storage layer.
* **Files:** `src/services/storageService.ts`, `src/hooks/useTemplates.ts`, `src/hooks/usePresentations.ts`
* **Details:**
* Implement `exportAppState()` to serialize `localStorage` data into a JSON string.
* Implement `importAppState(jsonString: string)` with schema validation before saving.
* Create helper queries/hooks to count active vs. finished presentations per template ID.


---

**Task 7: Reusable Modal System & Context**

* **Goal:** Build a custom modal component to eliminate browser `window.alert` and `window.confirm`.
* **Files:** `src/components/common/Modal.tsx`, `src/context/ModalContext.tsx`
* **Details:**
* Create a centered modal overlay with a dimmed backdrop (`bg-black/50`).
* Add click-outside backdrop dismiss (triggers cancel) and `Escape` key handler.
* Provide standard confirmation and alert layouts accepting custom titles, body messages, and callbacks.
* Replace remaining native browser dialogs across the app.


---

**Task 8a: Header Helpers & Dynamic Grid Rendering**

* **Goal:** Upgrade the base grid component to support dynamic dimensions (1x1 to 99x99) and row/column headers.
* **Files:** `src/components/common/Grid.tsx`, `src/utils/gridUtils.ts`
* **Details:**
* Add `getColLabel(index: number)` in `gridUtils.ts` (0 = A, 25 = Z, 26 = AA).
* Render outer header row (A, B, C...) and header column (1, 2, 3...).
* Accept independent dynamic `rows` and `cols` props ranging from 1 to 99.


---

**Task 8b: Header & Object Hover Highlighting**

* **Goal:** Implement cell, header, and grouped object hover interaction states.
* **Files:** `src/components/common/Grid.tsx`
* **Details:**
* Track currently hovered cell coordinate.
* Highlight the active cell's column letter and row number headers on hover.
* When hovering a cell belonging to an object/ship, apply a hover highlight style to all coordinate cells tied to that same `shipId`.


---

**Task 9a: Template Builder Header & Layout Updates**

* **Goal:** Add real-time dimension inputs and standard Save button controls.
* **Files:** `src/components/template/TemplateBuilder.tsx`
* **Details:**
* Add width and height inputs (1–99) to dynamically update the active template grid size before saving.
* Add a dedicated `Save` button (saves and navigates back to Dashboard) alongside `Save & Start` and `Cancel`.


---

**Task 9b: Live Drag-Drawing & Backtracking Engine**

* **Goal:** Implement live interactive path drawing with backtracking removal and adjacency rules.
* **Files:** `src/components/template/TemplateBuilder.tsx`, `src/utils/drawingLogic.ts`
* **Details:**
* Render live object previews as the mouse drags across empty cells.
* Retracting the mouse back over the current drawn path removes stepped-off cells.
* Prevent drawing over occupied cells, but allow adjacent touching placements.


---

**Task 9c: Color Palette Auto-Cycling**

* **Goal:** Automatically step through palette colors after every completed object creation.
* **Files:** `src/components/template/TemplateBuilder.tsx`, `src/components/template/ColorPicker.tsx`
* **Details:**
* Upon finishing a drag-draw object placement, auto-select the next color in the palette sequence.
* Loop back to the first color index when reaching the end of the palette list.


---

**Task 10: Presentation Statistics & Lifecycle Engine Update**

* **Goal:** Refactor presentation tracking to object-level counts, misses, and updated timestamps.
* **Files:** `src/components/presentation/PresentationView.tsx`, `src/utils/gameLogic.ts`
* **Details:**
* Track and display misses alongside hits.
* Update summary string format: `X objects | Y hits | Z misses | W destroyed`.
* Calculate `objects` and `destroyed` using distinct object/ship counts instead of cell totals.
* Update `lastUpdatedAt` on every turn and record `finishedAt` upon game completion.


---

**Task 11a: Dashboard Date Formats & Presentation Metrics**

* **Goal:** Display formatted local dates and live presentation status counters on Dashboard cards.
* **Files:** `src/components/dashboard/Dashboard.tsx`
* **Details:**
* Format template `createdAt` and presentation `startedAt`, `lastUpdatedAt`, and `finishedAt` using local timezone/formatting (`toLocaleString`).
* Display counts for ongoing vs. finished presentations directly on each template card.


---

**Task 11b: Import/Export UI Integration**

* **Goal:** Add controls for backing up and restoring full application JSON state.
* **Files:** `src/components/dashboard/ImportExportControls.tsx`, `src/components/dashboard/Dashboard.tsx`
* **Details:**
* Build export button triggering a browser `.json` download of current app state.
* Build file import picker with validation and error toast/modal feedback.
* Mount controls on the Dashboard view.


### Phase 2 Status

Implementation started.

* **Task 6a** (types: `createdAt`, `width`/`height`, `startedAt`/`lastUpdatedAt`/`finishedAt`, plus `AppState` and `TemplatePresentationCounts`) — done.
* **Task 6b** (`exportAppState`, `importAppState` with validation, per-template presentation counts; hooks `useExportAppState`/`useImportAppState`/`useTemplatePresentationCountsMap`; legacy `size` migration) — done.
* **Task 7** (reusable `Modal` + `ModalContext`/`useModal` with `confirm`/`alert`, Escape + click-outside dismiss; all `window.confirm`/`window.alert` removed) — done.
* **Task 8a** (`Grid` now takes `rows`/`cols`, renders row/column headers, `gridUtils.getColLabel`) — done.
* **Task 8b** (hover cell highlight, column/row header highlight, whole-object hover highlight via `getShipIdAt`) — done.
* **Task 9a** (independent width/height inputs 1–99, dedicated `Save` button alongside `Save & start` and `Cancel`) — done.
* **Task 9b** (live drag-drawing preview, backtracking removal, no-overlap + adjacency rules via `drawingLogic.extendPath`) — done.
* **Task 9c** (auto-advance palette color after each committed object, looping back to first) — done.
* **Task 10** (object-level `objects`/`destroyed` counts, added `misses`, `lastUpdatedAt`/`finishedAt` lifecycle; `getPresentationStats`) — done.
* **Task 11a** (local-timezone date formatting on dashboard + presentation, ongoing/finished counts per template) — done.
* **Task 11b** (`ImportExportControls` with JSON download + validated import picker and modal feedback, mounted on Dashboard) — done.

Verification: `bun x tsc --noEmit` clean, `bun run build:frontend` succeeds, dev server boots.
