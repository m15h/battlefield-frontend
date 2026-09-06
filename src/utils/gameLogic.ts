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

export function createBlankGrid(size: number): PresentationCell[] {
  const cells: PresentationCell[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      cells.push({ coordinate: { x, y }, state: "hidden" });
    }
  }
  return cells;
}

export function shipIsSunk(
  ship: Ship,
  hitCoordinates: Coordinate[]
): boolean {
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

export function getSunkShipIds(
  ships: Ship[],
  hitCoordinates: Coordinate[]
): Set<string> {
  const sunk = ships
    .filter((s) => shipIsSunk(s, hitCoordinates))
    .map((s) => s.id);
  return new Set(sunk);
}

export function countShots(grid: PresentationCell[]): number {
  return grid.reduce(
    (acc, c) => acc + (c.state === "hidden" ? 0 : 1),
    0
  );
}
