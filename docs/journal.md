
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

### Tasks

**Task 6: Extended Data Schema, Timestamps & App State I/O**

* **Goal:** Update TypeScript interfaces and storage layer to persist metadata timestamps, presentation metrics, and app-wide JSON import/export functions.
* **Files:** `src/types/index.ts`, `src/services/storageService.ts`, `src/hooks/useTemplates.ts`, `src/hooks/usePresentations.ts`
* **Details:**
* Update `Template` type to include `createdAt: string` (ISO timestamp) and dynamic grid dimensions `width: number`, `height: number`.
* Update `Presentation` type to include `startedAt: string`, `lastUpdatedAt: string`, and optional `finishedAt?: string`.
* In `storageService.ts`, add methods `exportAppState(): string` (serializes templates and presentations into a JSON file) and `importAppState(jsonString: string): void` (parses and validates JSON before writing to `localStorage`).
* Add helper queries to aggregate active vs. finished presentation counts per template ID.

---

**Task 7: Modal System Component**

* **Goal:** Create a custom modal system to eliminate all native `window.alert` and `window.confirm` calls.
* **Files:** `src/components/common/Modal.tsx`, `src/context/ModalContext.tsx`
* **Details:**
* Build a centered modal overlay with a dimmed backdrop (`bg-black/50`).
* Support click-outside backdrop dismiss (treated as "Cancel" action) and `Escape` key listeners.
* Provide confirmation and alert dialog layouts accepting custom titles, body messages, confirm labels, and action callbacks.
* Replace any remaining browser-native dialogs throughout the application with this component.

---

**Task 8: Enhanced Interactive Grid with Headers & Hover Highlighting**

* **Goal:** Upgrade the base grid component to support dynamic dimensions (1x1 to 99x99), row/column headers, and multi-cell hover interactions.
* **Files:** `src/components/common/Grid.tsx`, `src/utils/gridUtils.ts`
* **Details:**
* In `gridUtils.ts`, create helper function to convert column index to letters (0 = A, 25 = Z, 26 = AA, etc.).
* Add header row (A..Z..) and header column (1..99) around the main battlefield grid.
* Track active cell hover state. When hovering a cell, highlight its corresponding column and row header labels.
* When hovering over a cell belonging to a ship/object, apply hover visual styling to all cells sharing that same `shipId`.
* Accept dynamic independent `rows` and `cols` props ranging from `1` to `99`.

---

**Task 9: Advanced Drag-Drawing Engine & Dynamic Template Controls**

* **Goal:** Implement responsive grid size controls, live path drawing with backtracking removal, valid adjacency rules, auto-color cycling, and save options in template builder.
* **Files:** `src/components/template/TemplateBuilder.tsx`, `src/utils/drawingLogic.ts`
* **Details:**
* Add inputs allowing users to alter row/column counts (1–99) dynamically at any time prior to template save.
* Add a `Save` button (saves template and returns to dashboard) alongside existing `Save & Start` and `Cancel` buttons.
* Implement live drag-drawing logic in `drawingLogic.ts`:
* Draw preview live as mouse drags across contiguous, unassigned cells.
* If the cursor retraces steps over the current drawing sequence, remove those cells from the active path.
* Prevent drawing over cells already occupied by saved objects. Touch/adjacent placement is allowed.


* Automatically cycle the selected color to the next palette item upon object creation completion (looping back to index 0).

---

**Task 10: Presentation UI Refresh & Granular Game Stats**

* **Goal:** Update the presentation summary bar to measure object-level stats, track misses, and display live lifecycle timestamps.
* **Files:** `src/components/presentation/PresentationView.tsx`, `src/utils/gameLogic.ts`
* **Details:**
* Update state tracking to record `misses` (clicks on empty cells).
* Modify status bar text under template name to follow format: `X objects | Y hits | Z misses | W destroyed`.
* Calculate `objects` as total count of distinct `Ship` entities and `destroyed` as count of fully hit `Ship` entities (rather than counting raw cells).
* Update `lastUpdatedAt` timestamp on every move mutation, and set `finishedAt` when all objects are destroyed.
* Hover highlights for column/row headers from Task 8 must also function during presentation play.

---

**Task 11: Dashboard Overhaul & Backup Management**

* **Goal:** Enhance dashboard list items with locale-formatted dates, presentation counters, and full application JSON state backup/restore options.
* **Files:** `src/components/dashboard/Dashboard.tsx`, `src/components/dashboard/ImportExportControls.tsx`
* **Details:**
* Display template `createdAt` dates and presentation `startedAt`, `lastUpdatedAt`, and `finishedAt` dates in user's local timezone/format.
* Display live metrics on template cards showing total number of ongoing vs. finished presentations.
* Build `ImportExportControls` component with "Export JSON" (triggers browser download of current state) and "Import JSON" (file input picker with validation error handling).


### Phase 2 Status

Backlog
