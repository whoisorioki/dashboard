import { useEffect, useRef } from "react";
import { queryClient } from "./queryClient";

const POLL_INTERVAL = 1000 * 60 * 5; // 5 minutes
const ENDPOINT = "/api/health/data-version";

const isFirstDayOfMonth = () => {
  const now = new Date();
  return now.getDate() === 1;
};

export function useDataVersionPoll() {
  const lastVersionRef = useRef<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    let isMounted = true;

    async function poll() {
      try {
        const res = await fetch(ENDPOINT);
        if (!res.ok) return;
        const json = await res.json();
        const version = json?.lastIngestionTime;
        if (
          version &&
          lastVersionRef.current &&
          version !== lastVersionRef.current
        ) {
          queryClient.invalidateQueries();
        }
        if (version) {
          lastVersionRef.current = version;
        }
      } catch (e) {
        // Optionally log error
      }
    }

    if (isFirstDayOfMonth()) {
      poll(); // initial poll
      intervalId = setInterval(poll, POLL_INTERVAL);
    } else {
      poll(); // Only poll once on mount for non-first days
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);
}
