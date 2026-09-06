import type { Presentation, Template } from "../types";

const TEMPLATES_KEY = "battlefield.templates";
const PRESENTATIONS_KEY = "battlefield.presentations";

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

export const storageService = {
  getTemplates(): Template[] {
    return read<Template>(TEMPLATES_KEY);
  },

  saveTemplate(template: Template): Template {
    const templates = storageService.getTemplates();
    const exists = templates.some((t) => t.id === template.id);
    if (exists) {
      const next = templates.map((t) => (t.id === template.id ? template : t));
      write(TEMPLATES_KEY, next);
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
    return read<Presentation>(PRESENTATIONS_KEY);
  },

  savePresentation(presentation: Presentation): Presentation {
    const presentations = storageService.getPresentations();
    const exists = presentations.some((p) => p.id === presentation.id);
    if (exists) {
      const next = presentations.map((p) =>
        p.id === presentation.id ? presentation : p
      );
      write(PRESENTATIONS_KEY, next);
    } else {
      write(PRESENTATIONS_KEY, [...presentations, presentation]);
    }
    return presentation;
  },

  getPresentation(id: string): Presentation | undefined {
    return storageService
      .getPresentations()
      .find((p) => p.id === id);
  },

  deletePresentation(id: string): void {
    write(
      PRESENTATIONS_KEY,
      storageService.getPresentations().filter((p) => p.id !== id)
    );
  },
};

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
