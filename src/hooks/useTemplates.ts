import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { storageService } from "../services/storageService";
import type { Template } from "../types";

export const queryKeys = {
  templates: () => ["templates"] as const,
  presentations: () => ["presentations"] as const,
};

export function useTemplates() {
  return useQuery<Template[]>({
    queryKey: queryKeys.templates(),
    queryFn: () => storageService.getTemplates(),
  });
}

type SaveTemplateOptions = {
  onSuccess?: (template: Template) => void;
  onError?: (error: unknown) => void;
};

export function useSaveTemplate(options: SaveTemplateOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<Template, unknown, Template>({
    mutationFn: (template) =>
      Promise.resolve(storageService.saveTemplate(template)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates() });
    },
  });

  return {
    ...mutation,
    mutate: (variables: Template) =>
      mutation.mutate(variables, {
        onSuccess: (template) => options.onSuccess?.(template),
        onError: (error) => options.onError?.(error),
      }),
  };
}

type DeleteTemplateOptions = {
  onSuccess?: (id: string) => void;
  onError?: (error: unknown) => void;
};

export function useDeleteTemplate(options: DeleteTemplateOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<unknown, unknown, string>({
    mutationFn: (id) => {
      storageService.deleteTemplate(id);
      return Promise.resolve();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates() });
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
