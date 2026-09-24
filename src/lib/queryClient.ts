import { QueryClient, type QueryKey } from "@tanstack/react-query";
import { isApiError } from "@/services";

const MAX_RETRIES = 3;

export const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < MAX_RETRIES && isApiError(error) && error.isRetryable;

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  });

export async function appendToCachedList<TItem extends { id: number }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  item: TItem,
) {
  await queryClient.cancelQueries({ queryKey });
  queryClient.setQueryData<TItem[]>(queryKey, (items) =>
    items && !items.some(({ id }) => id === item.id) ? [...items, item] : items,
  );
}
