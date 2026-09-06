import { useCallback, useState } from "react";
import type { DragAction } from "@/components/common/Grid";
import { Grid } from "@/components/common/Grid";
import type { Coordinate, Ship, Template } from "@/types";
import { createId } from "@/services/storageService";
import { useSaveTemplate } from "@/hooks/useTemplates";
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

interface TemplateBuilderProps {
  onDone: (template: Template) => void;
  onCancel: () => void;
}

function coordKey(c: Coordinate): string {
  return `${c.x},${c.y}`;
}

function sameCoord(a: Coordinate, b: Coordinate): boolean {
  return a.x === b.x && a.y === b.y;
}

function findShipAt(ships: Ship[], coord: Coordinate): Ship | undefined {
  return ships.find((s) => s.coordinates.some((c) => sameCoord(c, coord)));
}

export function TemplateBuilder({ onDone, onCancel }: TemplateBuilderProps) {
  const size = DEFAULT_SIZE;
  const [name, setName] = useState<string>("New template");
  const [ships, setShips] = useState<Ship[]>([]);
  const [activeColor, setActiveColor] = useState<string>(
    PALETTE[0] ?? "#e63946"
  );
  const saveTemplate = useSaveTemplate({
    onSuccess: (t) => onDone(t),
  });

  const handleCellClick = useCallback(
    (coord: Coordinate) => {
      const existing = findShipAt(ships, coord);
      if (existing) {
        const remaining = existing.coordinates.filter((c) => !sameCoord(c, coord));
        setShips((prev) =>
          prev
            .map((ship) =>
              ship.id === existing.id ? { ...ship, coordinates: remaining } : ship
            )
            .filter((s) => s.coordinates.length > 0)
        );
      } else {
        setShips((prev) => [
          ...prev,
          {
            id: createId("ship"),
            color: activeColor,
            coordinates: [coord],
          },
        ]);
      }
    },
    [ships, activeColor]
  );

  const handleCellDrag = useCallback(
    (coordsIn: Coordinate[], action: DragAction) => {
      if (action === "add") {
        setShips((prev) => {
          const copy: Ship[] = prev.map((s) => ({
            ...s,
            coordinates: [...s.coordinates],
          }));
          for (const coord of coordsIn) {
            const existing = findShipAt(copy, coord);
            if (existing) {
              existing.coordinates.push(coord);
            } else {
              copy.push({
                id: createId("ship"),
                color: activeColor,
                coordinates: [coord],
              });
            }
          }
          return copy;
        });
      } else {
        setShips((prev) =>
          prev
            .map((ship) => ({
              ...ship,
              coordinates: ship.coordinates.filter(
                (c) => !coordsIn.some((cc) => sameCoord(cc, c))
              ),
            }))
            .filter((s) => s.coordinates.length > 0)
        );
      }
    },
    [activeColor]
  );

  const handleSave = () => {
    if (ships.length === 0) return;
    saveTemplate.mutate({
      id: createId("tpl"),
      name: name.trim() || "Untitled template",
      size,
      ships,
    });
  };

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
        <ColorPicker
          colors={PALETTE}
          value={activeColor}
          onChange={setActiveColor}
        />
        <div className="bf-builder__actions">
          <button
            type="button"
            disabled={ships.length === 0 || saveTemplate.isPending}
            onClick={handleSave}
          >
            Save &amp; start
          </button>
          <button type="button" onClick={onCancel} className="bf-btn--ghost">
            Cancel
          </button>
        </div>
        <p className="bf-hint">
          Left-click or drag to paint ships. Right-click to erase. Switch
          colors to start a new ship.
        </p>
      </div>

      <div className="bf-builder__grid-wrap">
        <Grid
          size={size}
          onCellClick={handleCellClick}
          onCellDrag={handleCellDrag}
          renderCell={(coord) => {
            const ship = findShipAt(ships, coord);
            return ship ? (
              <span
                className="bf-cell__content"
                style={{ background: ship.color }}
              />
            ) : null;
          }}
        />
      </div>
    </div>
  );
}
