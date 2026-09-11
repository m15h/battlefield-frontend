import { useCallback, useMemo } from "react";
import type { Coordinate, Presentation, PresentationCell, Template } from "@/types";
import { Grid, type GridCellContext } from "@/components/common/Grid";
import {
  findShipAt,
  getHitCoordinates,
  getPresentationStats,
  isHitAt,
  shipIsSunk,
} from "@/utils/gameLogic";
import { formatDate } from "@/utils/dates";

interface PresentationViewProps {
  template: Template;
  grid: PresentationCell[];
  presentation: Presentation;
  alreadyShot: (coord: Coordinate) => boolean;
  onCellClick: (coord: Coordinate, hit: boolean) => void;
  onBack: () => void;
}

export function PresentationView({
  template,
  grid,
  presentation,
  alreadyShot,
  onCellClick,
  onBack,
}: PresentationViewProps) {
  const ships = template.ships;

  const stats = useMemo(() => getPresentationStats(ships, grid), [ships, grid]);
  const finished =
    stats.objects > 0 && stats.destroyed === stats.objects;

  const sunkIds = useMemo(() => {
    const set = new Set<string>();
    const hitCoords = getHitCoordinates(grid);
    for (const ship of ships) {
      if (shipIsSunk(ship, hitCoords)) set.add(ship.id);
    }
    return set;
  }, [ships, grid]);

  const cellByCoord = useMemo(() => {
    const m = new Map<string, PresentationCell>();
    for (const cell of grid) {
      m.set(`${cell.coordinate.x},${cell.coordinate.y}`, cell);
    }
    return m;
  }, [grid]);

  const getShipIdAt = useCallback(
    (coord: Coordinate) => findShipAt(ships, coord)?.id,
    [ships]
  );

  const renderCell = useCallback(
    (coord: Coordinate, ctx: GridCellContext) => {
      const cell = cellByCoord.get(`${coord.x},${coord.y}`);
      const state = cell?.state ?? "hidden";
      const ship = findShipAt(ships, coord);
      const sunk = ship ? sunkIds.has(ship.id) : false;
      const classes = [
        "bf-cell__content",
        state === "hit" ? "bf-cell__content--hit" : "",
        state === "miss" ? "bf-cell__content--miss" : "",
        sunk ? "bf-cell__content--sunk" : "",
        ship && ctx.inHoveredObject ? "bf-cell__content--obj-hover" : "",
      ]
        .filter(Boolean)
        .join(" ");
      return <span className={classes} />;
    },
    [cellByCoord, ships, sunkIds]
  );

  return (
    <div className="bf-presentation">
      <div className="bf-presentation__header">
        <div>
          <h2 className="bf-presentation__title">{template.name}</h2>
          <p className="bf-presentation__meta">
            {stats.objects} object{stats.objects === 1 ? "" : "s"} ·{" "}
            {stats.hits} hit{stats.hits === 1 ? "" : "s"} ·{" "}
            {stats.misses} miss{stats.misses === 1 ? "" : "es"} ·{" "}
            {stats.destroyed} destroyed
          </p>
          <p className="bf-presentation__dates">
            Started {formatDate(presentation.startedAt)} · Updated{" "}
            {formatDate(presentation.lastUpdatedAt)}
            {presentation.finishedAt
              ? ` · Finished ${formatDate(presentation.finishedAt)}`
              : ""}
          </p>
        </div>
        <button type="button" className="bf-btn--ghost" onClick={onBack}>
          Back to dashboard
        </button>
      </div>

      <div className="bf-presentation__grid-wrap">
        <Grid
          rows={template.height}
          cols={template.width}
          renderCell={renderCell}
          getShipIdAt={getShipIdAt}
          disabled={finished}
          onCellClick={(c, action) => {
            if (action !== "add") return;
            if (!finished && !alreadyShot(c)) {
              const hit = isHitAt(ships, c);
              onCellClick(c, hit);
            }
          }}
        />

        {finished && (
          <div className="bf-presentation__overlay">
            <div className="bf-presentation__overlay-inner">
              <h3>Presentation finished!</h3>
              <p>Every object has been destroyed. Great job.</p>
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
