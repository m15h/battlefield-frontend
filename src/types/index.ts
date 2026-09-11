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
  createdAt: string;
  width: number;
  height: number;
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
  startedAt: string;
  lastUpdatedAt: string;
  finishedAt?: string;
  grid: PresentationCell[];
  isFinished: boolean;
}

export interface AppState {
  version: number;
  templates: Template[];
  presentations: Presentation[];
}

export interface TemplatePresentationCounts {
  ongoing: number;
  finished: number;
}
