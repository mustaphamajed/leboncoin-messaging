import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/services'

export const userKeys = {
  all: ['users'] as const,
}

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: ({ signal }) => getUsers({ signal }),
    staleTime: 5 * 60_000,
  })
}
