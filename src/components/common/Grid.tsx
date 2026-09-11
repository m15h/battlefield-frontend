import { useCallback, useRef, useState } from "react";
import type { Coordinate } from "@/types";
import { coordKey, getColLabel, sameCoord } from "@/utils/gridUtils";

export type DragAction = "add" | "remove";

export interface GridCellContext {
  isDragging: boolean;
  isHovered: boolean;
  inHoveredObject: boolean;
}

export interface GridProps {
  rows: number;
  cols: number;
  renderCell: (coord: Coordinate, ctx: GridCellContext) => React.ReactNode;
  getShipIdAt?: (coord: Coordinate) => string | undefined;
  onCellClick?: (coord: Coordinate, action: DragAction) => void;
  onStrokeStart?: (coord: Coordinate, action: DragAction) => void;
  onCellEnter?: (coord: Coordinate, action: DragAction) => void;
  onStrokeEnd?: (action: DragAction) => void;
  disabled?: boolean;
  className?: string;
}

export function Grid({
  rows,
  cols,
  renderCell,
  getShipIdAt,
  onCellClick,
  onStrokeStart,
  onCellEnter,
  onStrokeEnd,
  disabled,
  className,
}: GridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState<Coordinate | null>(null);
  const startRef = useRef<Coordinate | null>(null);
  const actionRef = useRef<DragAction>("add");
  const movedRef = useRef(false);
  const draggingRef = useRef(false);

  const handleMouseDown = useCallback(
    (coord: Coordinate, action: DragAction) => {
      if (disabled) return;
      startRef.current = coord;
      actionRef.current = action;
      movedRef.current = false;
      draggingRef.current = true;
      setIsDragging(true);
      onStrokeStart?.(coord, action);
    },
    [disabled, onStrokeStart]
  );

  const handleMouseEnter = useCallback(
    (coord: Coordinate) => {
      setHovered(coord);
      if (!draggingRef.current || disabled) return;
      onCellEnter?.(coord, actionRef.current);
      if (startRef.current && !sameCoord(startRef.current, coord)) {
        movedRef.current = true;
      }
    },
    [disabled, onCellEnter]
  );

  const finish = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    const start = startRef.current;
    const action = actionRef.current;
    startRef.current = null;
    if (!movedRef.current && start) {
      onCellClick?.(start, action);
    } else {
      onStrokeEnd?.(action);
    }
  }, [onCellClick, onStrokeEnd]);

  const clearHover = useCallback(() => setHovered(null), []);

  const hoveredShipId =
    hovered && getShipIdAt ? getShipIdAt(hovered) : undefined;

  const colHeaders: React.ReactNode[] = [
    <div key="corner" className="bf-grid__corner" />,
  ];
  for (let x = 0; x < cols; x++) {
    colHeaders.push(
      <div
        key={`col-${x}`}
        className={[
          "bf-grid__header",
          hovered && hovered.x === x ? "bf-grid__header--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {getColLabel(x)}
      </div>
    );
  }

  const rowHeaders: React.ReactNode[] = [];
  for (let y = 0; y < rows; y++) {
    rowHeaders.push(
      <div
        key={`row-${y}`}
        className={[
          "bf-grid__header",
          "bf-grid__header--row",
          hovered && hovered.y === y ? "bf-grid__header--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {y + 1}
      </div>
    );
  }

  const board: React.ReactNode[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const coord: Coordinate = { x, y };
      const cellShipId = getShipIdAt ? getShipIdAt(coord) : undefined;
      const inHoveredObject =
        !!hoveredShipId && cellShipId === hoveredShipId;
      const ctx: GridCellContext = {
        isDragging,
        isHovered: hovered ? sameCoord(hovered, coord) : false,
        inHoveredObject,
      };
      const cellClasses = [
        "bf-cell",
        ctx.isHovered ? "bf-cell--hovered" : "",
        inHoveredObject ? "bf-cell--obj-hover" : "",
      ]
        .filter(Boolean)
        .join(" ");
      board.push(
        <div
          key={coordKey(coord)}
          className={cellClasses}
          onMouseDown={(e) => {
            e.preventDefault();
            handleMouseDown(coord, "add");
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            handleMouseDown(coord, "remove");
          }}
          onMouseEnter={() => handleMouseEnter(coord)}
        >
          {renderCell(coord, ctx)}
        </div>
      );
    }
  }

  const gridTemplateColumns = `minmax(1.4rem, 2.4rem) repeat(${cols}, minmax(0, 1fr))`;
  const gridTemplateRows = `minmax(1.2rem, 1.8rem) repeat(${rows}, minmax(0, 1fr))`;

  return (
    <div
      className={`bf-grid-board ${className ?? ""}`}
      style={{ gridTemplateColumns, gridTemplateRows }}
      onMouseUp={finish}
      onMouseLeave={() => {
        finish();
        clearHover();
      }}
    >
      {colHeaders}
      {rowHeaders}
      {board}
    </div>
  );
}
