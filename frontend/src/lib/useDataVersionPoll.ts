import { useEffect, useRef } from "react";
import { queryClient } from "./queryClient";
import { GraphQLClient } from "graphql-request";
import { HealthStatusQuery, useHealthStatusQuery } from "../queries/healthStatus.generated";

const POLL_INTERVAL = 1000 * 60 * 5; // 5 minutes

const isFirstDayOfMonth = () => {
  const now = new Date();
  return now.getDate() === 1;
};

export function useDataVersionPoll() {
  const lastVersionRef = useRef<string | null>(null);
  const client = new GraphQLClient(import.meta.env.VITE_API_GRAPHQL_URL || "http://localhost:8000/graphql");

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    let isMounted = true;

    async function poll() {
      try {
        const data: HealthStatusQuery = await client.request(
          `query HealthStatus { dataVersion { lastIngestionTime } }`
        );
        const version = data?.dataVersion?.lastIngestionTime;
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
