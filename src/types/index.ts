export interface Coordinate {
  x: number;
  y: number;
}

export interface Ship {
  id: string;
  color: string;
  coordinates: Coordinate[];
}

export interface Template {
  id: string;
  name: string;
  size: number;
  ships: Ship[];
}

export type PresentationCellState = "hidden" | "hit" | "miss";

export interface PresentationCell {
  coordinate: Coordinate;
  state: PresentationCellState;
}

export interface Presentation {
  id: string;
  templateId: string;
  name: string;
  grid: PresentationCell[];
  isFinished: boolean;
}
