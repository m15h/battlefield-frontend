import type {
  Coordinate,
  PresentationCell,
  Ship,
} from "@/types";

export function sameCoord(a: Coordinate, b: Coordinate): boolean {
  return a.x === b.x && a.y === b.y;
}

export function coordKey(c: Coordinate): string {
  return `${c.x},${c.y}`;
}

export function createBlankGrid(width: number, height: number): PresentationCell[] {
  const cells: PresentationCell[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({ coordinate: { x, y }, state: "hidden" });
    }
  }
  return cells;
}

export function shipIsSunk(ship: Ship, hitCoordinates: Coordinate[]): boolean {
  if (ship.coordinates.length === 0) return true;
  return ship.coordinates.every((cell) =>
    hitCoordinates.some((h) => sameCoord(h, cell))
  );
}

export function isShipOnCell(ship: Ship, coord: Coordinate): boolean {
  return ship.coordinates.some((c) => sameCoord(c, coord));
}

export function findShipAt(
  ships: Ship[],
  coord: Coordinate
): Ship | undefined {
  return ships.find((s) => isShipOnCell(s, coord));
}

export function isHitAt(ships: Ship[], coord: Coordinate): boolean {
  return ships.some((s) => isShipOnCell(s, coord));
}

export function allShipsSunk(
  ships: Ship[],
  hitCoordinates: Coordinate[]
): boolean {
  if (ships.length === 0) return false;
  return ships.every((s) => shipIsSunk(s, hitCoordinates));
}

export function applyShot(
  grid: PresentationCell[],
  coord: Coordinate,
  hit: boolean
): PresentationCell[] {
  return grid.map((cell) =>
    sameCoord(cell.coordinate, coord)
      ? { ...cell, state: hit ? "hit" : "miss" }
      : cell
  );
}

export function getHitCoordinates(grid: PresentationCell[]): Coordinate[] {
  return grid.filter((c) => c.state === "hit").map((c) => c.coordinate);
}

export function countMisses(grid: PresentationCell[]): number {
  return grid.reduce((acc, c) => acc + (c.state === "miss" ? 1 : 0), 0);
}

export interface PresentationStats {
  objects: number;
  hits: number;
  misses: number;
  destroyed: number;
}

export function getPresentationStats(
  ships: Ship[],
  grid: PresentationCell[]
): PresentationStats {
  const hitCoords = getHitCoordinates(grid);
  const destroyed = ships.filter((s) => shipIsSunk(s, hitCoords)).length;
  return {
    objects: ships.length,
    hits: hitCoords.length,
    misses: countMisses(grid),
    destroyed,
  };
}
