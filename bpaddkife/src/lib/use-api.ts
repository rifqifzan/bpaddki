"use client";

import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "./api";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Fetches a backend path through the Next.js proxy.
 * Pass `null` to pause the request. Changing the path refetches automatically.
 */
export function useApiData<T>(path: string | null): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (path === null) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    api
      .get<T>(path, controller.signal)
      .then((result) => {
        if (!active) return;
        setData(result);
        setLoading(false);
      })
      .catch((cause) => {
        if (!active) return;
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }
        setError(errorMessage(cause));
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [path, version]);

  const reload = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  return { data, loading, error, reload };
}
