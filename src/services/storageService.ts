import type {
  AppState,
  Presentation,
  Template,
  TemplatePresentationCounts,
} from "../types";

const TEMPLATES_KEY = "battlefield.templates";
const PRESENTATIONS_KEY = "battlefield.presentations";
const EXPORT_VERSION = 1;

function read<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeTemplate(raw: unknown): Template | null {
  if (typeof raw !== "object" || raw === null) return null;
  const t = raw as Record<string, unknown>;
  if (typeof t.id !== "string" || typeof t.name !== "string") return null;
  const width =
    typeof t.width === "number" ? t.width : typeof t.size === "number" ? t.size : 10;
  const height =
    typeof t.height === "number" ? t.height : typeof t.size === "number" ? t.size : 10;
  const ships = Array.isArray(t.ships) ? (t.ships as Template["ships"]) : [];
  return {
    id: t.id,
    name: t.name,
    createdAt:
      typeof t.createdAt === "string" ? t.createdAt : new Date().toISOString(),
    width: clampDimension(width),
    height: clampDimension(height),
    ships,
  };
}

function normalizePresentation(raw: unknown): Presentation | null {
  if (typeof raw !== "object" || raw === null) return null;
  const p = raw as Record<string, unknown>;
  if (typeof p.id !== "string" || typeof p.templateId !== "string") return null;
  const now = new Date().toISOString();
  return {
    id: p.id,
    templateId: p.templateId,
    name: typeof p.name === "string" ? p.name : "Presentation",
    startedAt: typeof p.startedAt === "string" ? p.startedAt : now,
    lastUpdatedAt:
      typeof p.lastUpdatedAt === "string" ? p.lastUpdatedAt : now,
    finishedAt: typeof p.finishedAt === "string" ? p.finishedAt : undefined,
    grid: Array.isArray(p.grid) ? (p.grid as Presentation["grid"]) : [],
    isFinished: typeof p.isFinished === "boolean" ? p.isFinished : false,
  };
}

function clampDimension(value: number): number {
  if (!Number.isFinite(value)) return 10;
  return Math.min(99, Math.max(1, Math.round(value)));
}

export const storageService = {
  getTemplates(): Template[] {
    return read<unknown>(TEMPLATES_KEY)
      .map(normalizeTemplate)
      .filter((t): t is Template => t !== null);
  },

  saveTemplate(template: Template): Template {
    const templates = storageService.getTemplates();
    const exists = templates.some((t) => t.id === template.id);
    if (exists) {
      write(TEMPLATES_KEY, templates.map((t) => (t.id === template.id ? template : t)));
    } else {
      write(TEMPLATES_KEY, [...templates, template]);
    }
    return template;
  },

  getTemplate(id: string): Template | undefined {
    return storageService.getTemplates().find((t) => t.id === id);
  },

  deleteTemplate(id: string): void {
    write(
      TEMPLATES_KEY,
      storageService.getTemplates().filter((t) => t.id !== id)
    );
  },

  getPresentations(): Presentation[] {
    return read<unknown>(PRESENTATIONS_KEY)
      .map(normalizePresentation)
      .filter((p): p is Presentation => p !== null);
  },

  savePresentation(presentation: Presentation): Presentation {
    const presentations = storageService.getPresentations();
    const exists = presentations.some((p) => p.id === presentation.id);
    if (exists) {
      write(
        PRESENTATIONS_KEY,
        presentations.map((p) => (p.id === presentation.id ? presentation : p))
      );
    } else {
      write(PRESENTATIONS_KEY, [...presentations, presentation]);
    }
    return presentation;
  },

  getPresentation(id: string): Presentation | undefined {
    return storageService.getPresentations().find((p) => p.id === id);
  },

  deletePresentation(id: string): void {
    write(
      PRESENTATIONS_KEY,
      storageService.getPresentations().filter((p) => p.id !== id)
    );
  },

  getTemplatePresentationCounts(templateId: string): TemplatePresentationCounts {
    let ongoing = 0;
    let finished = 0;
    for (const p of storageService.getPresentations()) {
      if (p.templateId !== templateId) continue;
      if (p.isFinished) finished += 1;
      else ongoing += 1;
    }
    return { ongoing, finished };
  },

  exportAppState(): string {
    const state: AppState = {
      version: EXPORT_VERSION,
      templates: storageService.getTemplates(),
      presentations: storageService.getPresentations(),
    };
    return JSON.stringify(state, null, 2);
  },

  importAppState(jsonString: string): AppState {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error("File is not valid JSON.");
    }
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Invalid state file.");
    }
    const data = parsed as Record<string, unknown>;

    if (Array.isArray(data)) {
      throw new Error("Unexpected state format: expected an object.");
    }

    const templates: Template[] = [];
    if (data.templates !== undefined) {
      if (!Array.isArray(data.templates)) {
        throw new Error("templates must be an array.");
      }
      for (const raw of data.templates as unknown[]) {
        const t = normalizeTemplate(raw);
        if (!t) throw new Error("Invalid template entry found.");
        templates.push(t);
      }
    }

    const presentations: Presentation[] = [];
    if (data.presentations !== undefined) {
      if (!Array.isArray(data.presentations)) {
        throw new Error("presentations must be an array.");
      }
      for (const raw of data.presentations as unknown[]) {
        const p = normalizePresentation(raw);
        if (!p) throw new Error("Invalid presentation entry found.");
        presentations.push(p);
      }
    }

    if (templates.length === 0 && presentations.length === 0) {
      throw new Error("State file contains no data.");
    }

    write(TEMPLATES_KEY, templates);
    write(PRESENTATIONS_KEY, presentations);
    return { version: EXPORT_VERSION, templates, presentations };
  },
};

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
