import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { DragAction } from "@/components/common/Grid";
import { Grid, type GridCellContext } from "@/components/common/Grid";
import type { Coordinate, Ship, Template } from "@/types";
import { createId, storageService } from "@/services/storageService";
import { queryKeys } from "@/hooks/useTemplates";
import { useModal } from "@/context/ModalContext";
import { extendPath, type StrokePath } from "@/utils/drawingLogic";
import { sameCoord } from "@/utils/gridUtils";
import { ColorPicker } from "./ColorPicker";

const PALETTE: string[] = [
  "#e63946",
  "#f4a261",
  "#e9c46a",
  "#2a9d8f",
  "#457b9d",
  "#8e7cc3",
  "#d62828",
  "#f77f00",
  "#7b2cbf",
  "#0096c7",
];

const DEFAULT_SIZE = 10;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

interface TemplateBuilderProps {
  onDone: (result: { template: Template; start: boolean }) => void;
  onCancel: () => void;
}

export function TemplateBuilder({ onDone, onCancel }: TemplateBuilderProps) {
  const [name, setName] = useState<string>("New template");
  const [width, setWidth] = useState<number>(DEFAULT_SIZE);
  const [height, setHeight] = useState<number>(DEFAULT_SIZE);
  const [ships, setShips] = useState<Ship[]>([]);
  const [colorIndex, setColorIndex] = useState<number>(0);
  const [preview, setPreview] = useState<StrokePath | null>(null);
  const [previewColorIndex, setPreviewColorIndex] = useState<number>(0);
  const activeColor = PALETTE[colorIndex] ?? PALETTE[0] ?? "#e63946";

  const { alert } = useModal();
  const queryClient = useQueryClient();

  const occupiedCoords = useMemo(() => {
    const set = new Set<string>();
    for (const ship of ships) {
      for (const coord of ship.coordinates) {
        set.add(`${coord.x},${coord.y}`);
      }
    }
    return set;
  }, [ships]);

  const isOccupied = useCallback(
    (coord: Coordinate) => occupiedCoords.has(`${coord.x},${coord.y}`),
    [occupiedCoords]
  );

  const getShipIdAt = useCallback(
    (coord: Coordinate) => {
      if (preview?.some((c) => sameCoord(c, coord))) {
        return PALETTE[previewColorIndex] ?? "__preview__";
      }
      return ships.find((s) =>
        s.coordinates.some((c) => sameCoord(c, coord))
      )?.id;
    },
    [preview, previewColorIndex, ships]
  );

  const eraseAt = useCallback(
    (coord: Coordinate) => {
      setShips((prev) => {
        const existing = prev.find((s) =>
          s.coordinates.some((c) => sameCoord(c, coord))
        );
        if (!existing) return prev;
        const remaining = existing.coordinates.filter(
          (c) => !sameCoord(c, coord)
        );
        if (remaining.length === 0) {
          return prev.filter((s) => s.id !== existing.id);
        }
        return prev.map((s) =>
          s.id === existing.id ? { ...s, coordinates: remaining } : s
        );
      });
      setPreview(null);
    },
    []
  );

  const deleteShipAt = useCallback((coord: Coordinate) => {
    setShips((prev) => {
      const existing = prev.find((s) =>
        s.coordinates.some((c) => sameCoord(c, coord))
      );
      if (!existing) return prev;
      return prev.filter((s) => s.id !== existing.id);
    });
    setPreview(null);
  }, []);

  const handleStrokeStart = useCallback(
    (coord: Coordinate, action: DragAction) => {
      if (action === "remove") {
        deleteShipAt(coord);
        return;
      }
      const occupied = occupiedCoords.has(`${coord.x},${coord.y}`);
      if (occupied) {
        eraseAt(coord);
        setPreview(null);
        return;
      }
      setPreviewColorIndex(colorIndex);
      setPreview([coord]);
    },
    [eraseAt, occupiedCoords, colorIndex]
  );

  const handleCellEnter = useCallback(
    (coord: Coordinate, action: DragAction) => {
      console.log('ships', ships);
      if (action === "remove") {
        deleteShipAt(coord);
        return;
      }
      setPreview((prevPath) => {
        if (!prevPath) return prevPath;
        if (prevPath.some((c) => sameCoord(c, coord))) return prevPath;
        return extendPath(prevPath, coord, isOccupied);
      });
    },
    [deleteShipAt, isOccupied]
  );

  const commitPreview = useCallback(() => {
    const path = preview;
    if (!path || path.length === 0) {
      setPreview(null);
      return;
    }
    const ship: Ship = {
      id: createId("ship"),
      color: PALETTE[previewColorIndex] ?? "#e63946",
      coordinates: path.slice(),
    };
    setShips((prev) => [
      ...prev.filter(
        (s) => !s.coordinates.every((c) => path.some((p) => sameCoord(c, p)))
      ),
      ship,
    ]);
    setColorIndex((idx) => (idx + 1) % PALETTE.length);
    setPreview(null);
  }, [preview, previewColorIndex]);

  const handleCellClick = useCallback(
    (_coord: Coordinate, action: DragAction) => {
      if (action === "remove") {
        deleteShipAt(_coord);
        return;
      }
      // Single click: onStrokeStart already placed the cell in the preview.
      commitPreview();
    },
    [deleteShipAt, commitPreview]
  );

  const doSave = useCallback(
    (start: boolean) => {
      if (ships.length === 0) {
        void alert({
          title: "Nothing to save",
          message: "Add at least one object before saving.",
        });
        return;
      }
      const template: Template = {
        id: createId("tpl"),
        name: name.trim() || "Untitled template",
        createdAt: new Date().toISOString(),
        width,
        height,
        ships,
      };
      storageService.saveTemplate(template);
      queryClient.invalidateQueries({ queryKey: queryKeys.templates() });
      onDone({ template, start });
    },
    [ships, name, width, height, onDone, alert, queryClient]
  );

  const renderCell = useCallback(
    (coord: Coordinate, ctx: GridCellContext) => {
      const inPreview = preview?.some((c) => sameCoord(c, coord));
      if (inPreview) {
        const colorIdx = previewColorIndex;
        const color = PALETTE[colorIdx] ?? "#e63946";
        return (
          <span
            className="bf-cell__content"
            style={{ background: color, opacity: 0.85 }}
          />
        );
      }
      const ship = ships.find((s) => s.coordinates.some((c) => sameCoord(c, coord)));
      if (!ship) {
        return ctx.isHovered ? (
          <span className="bf-cell__content bf-cell__content--ghost" />
        ) : null;
      }
      return <span className="bf-cell__content" style={{ background: ship.color }} />;
    },
    [preview, previewColorIndex, ships]
  );

  return (
    <div className="bf-builder">
      <div className="bf-builder__header">
        <label className="bf-field">
          <span>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
          />
        </label>
        <label className="bf-field bf-field--small">
          <span>Columns (1–99)</span>
          <input
            type="number"
            min={1}
            max={99}
            value={width}
            onChange={(e) =>
              setWidth(clamp(parseInt(e.target.value, 10) || 1, 1, 99))
            }
          />
        </label>
        <label className="bf-field bf-field--small">
          <span>Rows (1–99)</span>
          <input
            type="number"
            min={1}
            max={99}
            value={height}
            onChange={(e) =>
              setHeight(clamp(parseInt(e.target.value, 10) || 1, 1, 99))
            }
          />
        </label>
        <ColorPicker
          colors={PALETTE}
          value={activeColor}
          onChange={(color) => {
            const idx = PALETTE.indexOf(color);
            if (idx >= 0) setColorIndex(idx);
          }}
        />
        <div className="bf-builder__actions">
          <button type="button" className="bf-btn--primary" onClick={() => doSave(false)}>
            Save
          </button>
          <button type="button" className="bf-btn--primary" onClick={() => doSave(true)}>
            Save &amp; start
          </button>
          <button type="button" className="bf-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <p className="bf-hint">
          Left-click or drag to paint objects. Right-click an object to
          delete it. Color cycles automatically after each object.
        </p>
      </div>

      <div className="bf-builder__grid-wrap">
        <Grid
          rows={height}
          cols={width}
          renderCell={renderCell}
          getShipIdAt={getShipIdAt}
          onCellClick={handleCellClick}
          onStrokeStart={handleStrokeStart}
          onCellEnter={handleCellEnter}
          onStrokeEnd={commitPreview}
        />
      </div>
    </div>
  );
}
