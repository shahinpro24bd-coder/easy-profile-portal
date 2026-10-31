import { useMemo } from "react";
import { useLocation, useParams as useTsParams, useRouter as useTsRouter } from "@tanstack/react-router";

/** Minimal next/navigation API implemented on TanStack Router. */
export function useRouter() {
  const router = useTsRouter();
  return useMemo(
    () => ({
      push: (href: string) => router.history.push(href),
      replace: (href: string) => router.history.replace(href),
      back: () => router.history.back(),
      refresh: () => router.invalidate(),
    }),
    [router],
  );
}

export function usePathname() {
  return useLocation({ select: (l) => l.pathname });
}

export function useSearchParams() {
  const searchStr = useLocation({ select: (l) => l.searchStr });
  return useMemo(() => new URLSearchParams(searchStr), [searchStr]);
}

export function useParams<T = Record<string, string>>() {
  return useTsParams({ strict: false }) as T;
}
