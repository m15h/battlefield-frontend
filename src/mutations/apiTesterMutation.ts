import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

export interface ApiTesterVariables {
  endpoint: string;
  method: string;
}

export function useApiTesterMutation(
  options?: Omit<UseMutationOptions<unknown, Error, ApiTesterVariables>, "mutationFn">
) {
  return useMutation<unknown, Error, ApiTesterVariables>({
    mutationFn: async ({ endpoint, method }) => {
      const url = new URL(endpoint, location.href);
      const res = await fetch(url, { method });
      return res.json();
    },
    ...options,
  });
}
