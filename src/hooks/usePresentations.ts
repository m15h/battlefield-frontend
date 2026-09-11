import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { storageService } from "../services/storageService";
import type {
  Presentation,
  Template,
  TemplatePresentationCounts,
} from "../types";
import { queryKeys } from "./useTemplates";

export function usePresentations() {
  return useQuery<Presentation[]>({
    queryKey: queryKeys.presentations(),
    queryFn: () => storageService.getPresentations(),
  });
}

export function useTemplatePresentationCountsMap() {
  const { data: presentations = [] } = usePresentations();
  const map = new Map<string, TemplatePresentationCounts>();
  for (const p of presentations) {
    const entry = map.get(p.templateId) ?? { ongoing: 0, finished: 0 };
    if (p.isFinished) entry.finished += 1;
    else entry.ongoing += 1;
    map.set(p.templateId, entry);
  }
  return map;
}

export function usePresentation(id: string | null) {
  return useQuery<Presentation | undefined>({
    queryKey: ["presentations", id],
    queryFn: () => (id ? storageService.getPresentation(id) : undefined),
    enabled: id !== null,
  });
}

export function useTemplate(id: string | null) {
  return useQuery<Template | undefined>({
    queryKey: ["templates", id],
    queryFn: () => (id ? storageService.getTemplate(id) : undefined),
    enabled: id !== null,
  });
}

type SavePresentationOptions = {
  onSuccess?: (presentation: Presentation) => void;
  onError?: (error: unknown) => void;
};

export function useSavePresentation(options: SavePresentationOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<Presentation, unknown, Presentation>({
    mutationFn: (presentation) =>
      Promise.resolve(storageService.savePresentation(presentation)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.presentations() });
    },
  });

  return {
    ...mutation,
    mutate: (variables: Presentation) =>
      mutation.mutate(variables, {
        onSuccess: (p) => options.onSuccess?.(p),
        onError: (error) => options.onError?.(error),
      }),
  };
}

type DeletePresentationOptions = {
  onSuccess?: (id: string) => void;
  onError?: (error: unknown) => void;
};

export function useDeletePresentation(options: DeletePresentationOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<unknown, unknown, string>({
    mutationFn: (id) => {
      storageService.deletePresentation(id);
      return Promise.resolve();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.presentations() });
    },
  });

  return {
    ...mutation,
    mutate: (variables: string) =>
      mutation.mutate(variables, {
        onSuccess: () => options.onSuccess?.(variables),
        onError: (error) => options.onError?.(error),
      }),
  };
}
