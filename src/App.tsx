import { useCallback, useState } from "react";
import { Dashboard, type DashboardActions } from "@/components/dashboard/Dashboard";
import { TemplateBuilder } from "@/components/template/TemplateBuilder";
import { PresentationView } from "@/components/presentation/PresentationView";
import {
  usePresentation,
  useSavePresentation,
  useTemplate,
} from "@/hooks/usePresentations";
import { createId } from "@/services/storageService";
import {
  allShipsSunk,
  applyShot,
  createBlankGrid,
  getHitCoordinates,
  sameCoord,
} from "@/utils/gameLogic";
import type { Coordinate, Presentation, PresentationCell, Template } from "@/types";

type View =
  | { kind: "dashboard" }
  | { kind: "createTemplate" }
  | { kind: "presentation"; id: string };

function PresentationSession({
  presentationId,
  onBack,
}: {
  presentationId: string;
  onBack: () => void;
}) {
  const { data: presentation } = usePresentation(presentationId);
  const { data: template } = useTemplate(presentation?.templateId ?? null);

  if (!presentation || !template) {
    return (
      <div className="bf-presentation">
        <p className="bf-hint">Loading presentation…</p>
        <button type="button" className="bf-btn--ghost" onClick={onBack}>
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <PresentationSessionInner
      key={presentation.id}
      presentation={presentation}
      template={template}
      onBack={onBack}
    />
  );
}

function PresentationSessionInner({
  presentation,
  template,
  onBack,
}: {
  presentation: Presentation;
  template: Template;
  onBack: () => void;
}) {
  const [grid, setGrid] = useState<PresentationCell[]>([
    ...presentation.grid,
  ]);
  const save = useSavePresentation();

  const alreadyShot = useCallback(
    (coord: Coordinate) =>
      grid.some((c) => c.state !== "hidden" && sameCoord(c.coordinate, coord)),
    [grid]
  );

  const handleShot = useCallback(
    (coord: Coordinate, hit: boolean) => {
      if (presentation.isFinished) return;
      const next = applyShot(grid, coord, hit);
      const finished = allShipsSunk(
        template.ships,
        getHitCoordinates(next)
      );
      const now = new Date().toISOString();
      setGrid(next);
      save.mutate({
        ...presentation,
        grid: next,
        isFinished: finished,
        lastUpdatedAt: now,
        finishedAt: finished ? now : presentation.finishedAt,
      });
    },
    [grid, save, presentation, template.ships]
  );

  return (
    <PresentationView
      template={template}
      grid={grid}
      presentation={presentation}
      alreadyShot={alreadyShot}
      onCellClick={handleShot}
      onBack={onBack}
    />
  );
}

export function App() {
  const [view, setView] = useState<View>({ kind: "dashboard" });
  const savePresentation = useSavePresentation();

  const startPresentation = useCallback(
    (template: Template) => {
      const id = createId("pres");
      const now = new Date().toISOString();
      savePresentation.mutate({
        id,
        templateId: template.id,
        name: template.name,
        startedAt: now,
        lastUpdatedAt: now,
        grid: createBlankGrid(template.width, template.height),
        isFinished: false,
      });
      setView({ kind: "presentation", id });
    },
    [savePresentation]
  );

  const handleTemplateDone = useCallback(
    (result: { template: Template; start: boolean }) => {
      if (result.start) {
        startPresentation(result.template);
      } else {
        setView({ kind: "dashboard" });
      }
    },
    [startPresentation]
  );

  const handleDashboardAction = useCallback(
    (action: DashboardActions) => {
      switch (action.type) {
        case "create-template":
          setView({ kind: "createTemplate" });
          break;
        case "start-presentation":
          startPresentation(action.template);
          break;
        case "resume-presentation":
          setView({ kind: "presentation", id: action.presentation.id });
          break;
      }
    },
    [startPresentation]
  );

  const goDashboard = useCallback(() => setView({ kind: "dashboard" }), []);

  return (
    <div className="bf-app">
      <header className="bf-header">
        <h1>Battlefield</h1>
        {view.kind !== "dashboard" && (
          <button type="button" className="bf-btn--ghost" onClick={goDashboard}>
            ← Dashboard
          </button>
        )}
      </header>

      <main className="bf-main">
        {view.kind === "dashboard" && (
          <Dashboard onAction={handleDashboardAction} />
        )}

        {view.kind === "createTemplate" && (
          <TemplateBuilder onDone={handleTemplateDone} onCancel={goDashboard} />
        )}

        {view.kind === "presentation" && (
          <PresentationSession
            presentationId={view.id}
            onBack={goDashboard}
          />
        )}
      </main>
    </div>
  );
}

export default App;
