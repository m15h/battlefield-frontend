import { useTemplates, useDeleteTemplate } from "@/hooks/useTemplates";
import {
  usePresentations,
  useDeletePresentation,
} from "@/hooks/usePresentations";
import type { Presentation, Template } from "@/types";

export type DashboardActions =
  | { type: "start-presentation"; template: Template }
  | { type: "resume-presentation"; presentation: Presentation }
  | { type: "create-template" };

interface DashboardProps {
  onAction: (action: DashboardActions) => void;
}

export function Dashboard({ onAction }: DashboardProps) {
  const { data: templates = [] } = useTemplates();
  const { data: presentations = [] } = usePresentations();
  const deleteTemplate = useDeleteTemplate();
  const deletePresentation = useDeletePresentation();

  const activePresentations = presentations.filter((p) => !p.isFinished);
  const finishedPresentations = presentations.filter((p) => p.isFinished);

  const sortedTemplates = [...templates]
    .sort((a: Template, b: Template) => a.name.localeCompare(b.name));
  const sortedActive = [...activePresentations].sort(
    (a: Presentation, b: Presentation) => b.name.localeCompare(a.name)
  );

  return (
    <div className="bf-dashboard">
      <section className="bf-dashboard__section">
        <h2>Templates</h2>
        {sortedTemplates.length === 0 ? (
          <p className="bf-hint">
            No templates yet. Create a new one to get started.
          </p>
        ) : (
          <ul className="bf-list">
            {sortedTemplates.map((t) => (
              <li key={t.id} className="bf-list__item">
                <div className="bf-list__info">
                  <span className="bf-list__name">{t.name}</span>
                  <span className="bf-list__meta">
                    {t.size}×{t.size} · {t.ships.length} ship
                    {t.ships.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="bf-list__actions">
                  <button
                    type="button"
                    className="bf-btn--primary"
                    onClick={() =>
                      onAction({ type: "start-presentation", template: t })
                    }
                  >
                    Start presentation
                  </button>
                  <button
                    type="button"
                    className="bf-btn--ghost"
                    onClick={() => {
                      if (window.confirm("Delete this template?")) {
                        deleteTemplate.mutate(t.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="bf-btn--primary"
          onClick={() => onAction({ type: "create-template" })}
        >
          + Create new template
        </button>
      </section>

      <section className="bf-dashboard__section">
        <h2>Active presentations</h2>
        {sortedActive.length === 0 ? (
          <p className="bf-hint">
            No active presentations. Start one from a template above.
          </p>
        ) : (
          <ul className="bf-list">
            {sortedActive.map((p) => (
              <li key={p.id} className="bf-list__item">
                <div className="bf-list__info">
                  <span className="bf-list__name">{p.name}</span>
                  <span className="bf-list__meta">
                    {p.grid.filter((c) => c.state !== "hidden").length} shots
                  </span>
                </div>
                <div className="bf-list__actions">
                  <button
                    type="button"
                    className="bf-btn--primary"
                    onClick={() =>
                      onAction({ type: "resume-presentation", presentation: p })
                    }
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    className="bf-btn--ghost"
                    onClick={() => {
                      if (window.confirm("Delete this presentation?")) {
                        deletePresentation.mutate(p.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {finishedPresentations.length > 0 && (
        <section className="bf-dashboard__section">
          <h2>Finished presentations</h2>
          <ul className="bf-list">
            {finishedPresentations.map((p) => (
              <li key={p.id} className="bf-list__item">
                <div className="bf-list__info">
                  <span className="bf-list__name">{p.name}</span>
                  <span className="bf-list__meta">finished</span>
                </div>
                <div className="bf-list__actions">
                  <button
                    type="button"
                    className="bf-btn--primary"
                    onClick={() =>
                      onAction({ type: "resume-presentation", presentation: p })
                    }
                  >
                    Review
                  </button>
                  <button
                    type="button"
                    className="bf-btn--ghost"
                    onClick={() => {
                      if (window.confirm("Delete this presentation?")) {
                        deletePresentation.mutate(p.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
