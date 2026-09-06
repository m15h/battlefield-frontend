import { useCallback, useRef, useState } from "react";
import type { Coordinate } from "@/types";

export type DragAction = "add" | "remove";

export interface GridProps {
  size: number;
  renderCell: (coord: Coordinate, isDragging: boolean) => React.ReactNode;
  onCellClick?: (coord: Coordinate) => void;
  onCellDrag?: (coords: Coordinate[], action: DragAction) => void;
  disabled?: boolean;
  className?: string;
}

const coordKey = (c: Coordinate) => `${c.x},${c.y}`;

export function Grid({
  size,
  renderCell,
  onCellClick,
  onCellDrag,
  disabled,
  className,
}: GridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Coordinate | null>(null);
  const strokeRef = useRef<Map<string, Coordinate>>(new Map());
  const actionRef = useRef<DragAction>("add");

  const handleMouseDown = useCallback(
    (coord: Coordinate, action: DragAction) => {
      if (disabled) return;
      setIsDragging(true);
      setDragStart(coord);
      actionRef.current = action;
      strokeRef.current = new Map([[coordKey(coord), coord]]);
    },
    [disabled]
  );

  const handleMouseEnter = useCallback((coord: Coordinate) => {
    if (!isDragging || disabled) return;
    strokeRef.current.set(coordKey(coord), coord);
  }, [isDragging, disabled]);

  const commitStroke = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    const cells = Array.from(strokeRef.current.values());
    const action = actionRef.current;
    strokeRef.current = new Map();
    if (cells.length === 1 && cells[0] && dragStart) {
      const only = cells[0];
      if (only.x === dragStart.x && only.y === dragStart.y) {
        if (action === "add" && onCellClick) {
          onCellClick(only);
        }
        return;
      }
    }
    if (onCellDrag && cells.length > 0) {
      onCellDrag(cells, action);
    }
  }, [dragStart, onCellClick, onCellDrag]);

  const cells: React.ReactNode[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const coord: Coordinate = { x, y };
      cells.push(
        <div
          key={coordKey(coord)}
          className="bf-cell"
          onMouseDown={() => handleMouseDown(coord, "add")}
          onContextMenu={(e) => {
            e.preventDefault();
            handleMouseDown(coord, "remove");
          }}
          onMouseEnter={() => handleMouseEnter(coord)}
        >
          {renderCell(coord, isDragging && dragStart !== null)}
        </div>
      );
    }
  }

  return (
    <div
      className={`bf-grid ${className ?? ""}`}
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      onMouseUp={commitStroke}
      onMouseLeave={commitStroke}
    >
      {cells}
    </div>
  );
}
