import { useMemo } from "react";
import type { Coordinate, PresentationCell, Ship, Template } from "@/types";
import { Grid } from "@/components/common/Grid";
import {
  allShipsSunk,
  findShipAt,
  getHitCoordinates,
  isHitAt,
  sameCoord,
} from "@/utils/gameLogic";

interface PresentationViewProps {
  template: Template;
  grid: PresentationCell[];
  alreadyShot: (coord: Coordinate) => boolean;
  onCellClick: (coord: Coordinate, hit: boolean) => void;
  onBack: () => void;
}

export function PresentationView({
  template,
  grid,
  alreadyShot,
  onCellClick,
  onBack,
}: PresentationViewProps) {
  const size = template.size;
  const ships: Ship[] = template.ships;

  const hitCoords = useMemo(() => getHitCoordinates(grid), [grid]);
  const sunkIds = useMemo(() => {
    const set = new Set<string>();
    for (const ship of ships) {
      if (ship.coordinates.every((c) => hitCoords.some((h) => sameCoord(h, c)))) {
        set.add(ship.id);
      }
    }
    return set;
  }, [ships, hitCoords]);

  const finished = allShipsSunk(ships, hitCoords);

  const cellByCoord = useMemo(() => {
    const m = new Map<string, PresentationCell>();
    for (const cell of grid) {
      m.set(`${cell.coordinate.x},${cell.coordinate.y}`, cell);
    }
    return m;
  }, [grid]);

  return (
    <div className="bf-presentation">
      <div className="bf-presentation__header">
        <div>
          <h2 className="bf-presentation__title">{template.name}</h2>
          <p className="bf-presentation__meta">
            {ships.length} ship{ships.length === 1 ? "" : "s"} ·{" "}
            {hitCoords.length} hit{hitCoords.length === 1 ? "" : "s"} ·{" "}
            {sunkIds.size} sunk
          </p>
        </div>
        <button type="button" className="bf-btn--ghost" onClick={onBack}>
          Back to dashboard
        </button>
      </div>

      <div className="bf-presentation__grid-wrap">
        <Grid
          size={size}
          onCellClick={(c) => {
            if (!finished && !alreadyShot(c)) {
              const hit = isHitAt(ships, c);
              onCellClick(c, hit);
            }
          }}
          renderCell={(coord) => {
            const cell = cellByCoord.get(`${coord.x},${coord.y}`);
            const state = cell?.state ?? "hidden";
            const ship = findShipAt(ships, coord);
            const sunk = ship ? sunkIds.has(ship.id) : false;
            return (
              <span
                className={[
                  "bf-cell__content",
                  state === "hit" ? "bf-cell__content--hit" : "",
                  state === "miss" ? "bf-cell__content--miss" : "",
                  sunk ? "bf-cell__content--sunk" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            );
          }}
        />

        {finished && (
          <div className="bf-presentation__overlay">
            <div className="bf-presentation__overlay-inner">
              <h3>Presentation finished!</h3>
              <p>Every ship has been destroyed. Great job.</p>
              <button type="button" className="bf-btn--primary" onClick={onBack}>
                Back to dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
