import { useEffect, useRef } from "react";
import { queryClient } from "./queryClient";

const POLL_INTERVAL = 1000 * 60 * 5; // 5 minutes
const ENDPOINT = "/api/health/data-version";

export function useDataVersionPoll() {
  const lastVersionRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

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

    poll(); // initial poll
    intervalId = setInterval(poll, POLL_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);
}
