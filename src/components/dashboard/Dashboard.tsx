import { useTemplates, useDeleteTemplate } from "@/hooks/useTemplates";
import {
  useDeletePresentation,
  usePresentations,
  useTemplatePresentationCountsMap,
} from "@/hooks/usePresentations";
import { useModal } from "@/context/ModalContext";
import type { Presentation, Template } from "@/types";
import { formatDate } from "@/utils/dates";
import { ImportExportControls } from "./ImportExportControls";

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
  const countsMap = useTemplatePresentationCountsMap();
  const { confirm } = useModal();

  const activePresentations = presentations.filter((p) => !p.isFinished);
  const finishedPresentations = presentations.filter((p) => p.isFinished);

  const sortedTemplates = [...templates].sort((a: Template, b: Template) =>
    a.name.localeCompare(b.name)
  );
  const sortedActive = [...activePresentations].sort((a, b) =>
    b.name.localeCompare(a.name)
  );

  const askDeleteTemplate = (t: Template) => {
    void confirm({
      title: "Delete template",
      message: `Delete "${t.name}" and all its data?`,
      confirmLabel: "Delete",
    }).then((ok) => {
      if (ok) deleteTemplate.mutate(t.id);
    });
  };

  const askDeletePresentation = (p: Presentation) => {
    void confirm({
      title: "Delete presentation",
      message: `Delete "${p.name}"?`,
      confirmLabel: "Delete",
    }).then((ok) => {
      if (ok) deletePresentation.mutate(p.id);
    });
  };

  return (
    <div className="bf-dashboard">
      <section className="bf-dashboard__section">
        <h2>Templates</h2>
        {sortedTemplates.length === 0 ? (
          <p className="bf-hint">No templates yet. Create a new one to get started.</p>
        ) : (
          <ul className="bf-list">
            {sortedTemplates.map((t) => {
              const counts = countsMap.get(t.id) ?? { ongoing: 0, finished: 0 };
              return (
                <li key={t.id} className="bf-list__item">
                  <div className="bf-list__info">
                    <span className="bf-list__name">{t.name}</span>
                    <span className="bf-list__meta">
                      {t.width}×{t.height} · {t.ships.length} object
                      {t.ships.length === 1 ? "" : "s"} · Created{" "}
                      {formatDate(t.createdAt)}
                    </span>
                    <span className="bf-list__meta">
                      {counts.ongoing} ongoing · {counts.finished} finished
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
                      onClick={() => askDeleteTemplate(t)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
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
                    Started {formatDate(p.startedAt)} · Updated{" "}
                    {formatDate(p.lastUpdatedAt)}
                  </span>
                </div>
                <div className="bf-list__actions">
                  <button
                    type="button"
                    className="bf-btn--primary"
                    onClick={() =>
                      onAction({
                        type: "resume-presentation",
                        presentation: p,
                      })
                    }
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    className="bf-btn--ghost"
                    onClick={() => askDeletePresentation(p)}
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
                  <span className="bf-list__meta">
                    Started {formatDate(p.startedAt)} · Finished{" "}
                    {formatDate(p.finishedAt)}
                  </span>
                </div>
                <div className="bf-list__actions">
                  <button
                    type="button"
                    className="bf-btn--primary"
                    onClick={() =>
                      onAction({
                        type: "resume-presentation",
                        presentation: p,
                      })
                    }
                  >
                    Review
                  </button>
                  <button
                    type="button"
                    className="bf-btn--ghost"
                    onClick={() => askDeletePresentation(p)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bf-dashboard__section">
        <h2>Backup</h2>
        <ImportExportControls onImported={() => {}} />
      </section>
    </div>
  );
}
