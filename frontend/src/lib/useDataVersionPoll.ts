import React, { useEffect, useRef } from "react";
import { queryClient } from "./queryClient";
import { GraphQLClient } from "graphql-request";
// Removed health status query as it doesn't exist in backend schema

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
        // For now, skip the health status query as it doesn't exist in our schema
        // We can implement this later when we add health status endpoints
        console.log("Data version polling enabled - health status query not implemented yet");
      } catch (e) {
        // Optionally log error
        console.log("Data version polling error:", e);
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
