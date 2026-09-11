import type { Coordinate } from "@/types";
import { sameCoord } from "@/utils/gridUtils";

export type StrokePath = Coordinate[];

function isAdjacent(a: Coordinate, b: Coordinate): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

/**
 * Attempt to extend a live drag path to a new cell.
 * - The new cell must not already be occupied (checked by caller).
 * - If the cursor steps back onto its own path, the stepped-off cells are
 *   removed (backtracking).
 * - Otherwise the move is only accepted when it is adjacent to a cell that
 *   is currently part of the object being drawn, keeping the object
 *   connected and allowing objects to touch other objects without
 *   overlapping.
 * Returns the new path, or the original path if the move is invalid.
 */
export function extendPath(
  path: StrokePath,
  next: Coordinate,
  isOccupied: (coord: Coordinate) => boolean
): StrokePath {
  if (isOccupied(next)) return path;

  const lastIdx = path.length - 1;
  const last = path[lastIdx];

  const nextIdx = path.findIndex((c) => sameCoord(c, next));
  if (nextIdx !== -1) {
    if (nextIdx === lastIdx) return path;
    // Backtracking: stepping back onto an earlier cell of the path trims
    // every cell after it (including the previous tail).
    if (nextIdx < lastIdx) {
      return path.slice(0, nextIdx + 1);
    }
    return path;
  }

  if (last && isAdjacent(last, next)) {
    return [...path, next];
  }

  return path;
}
