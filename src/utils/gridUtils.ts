import type { Coordinate } from "@/types";

export function clampDimension(value: number): number {
  if (!Number.isFinite(value)) return 10;
  return Math.min(99, Math.max(1, Math.round(value)));
}

export function getColLabel(index: number): string {
  let n = index;
  let label = "";
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

export function coordKey(c: Coordinate): string {
  return `${c.x},${c.y}`;
}

export function sameCoord(a: Coordinate, b: Coordinate): boolean {
  return a.x === b.x && a.y === b.y;
}
