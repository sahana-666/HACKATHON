import { useCallback, useEffect, useState } from "react";
import { ApiError, getEvents, type EventSummary } from "../api";

type State =
  | { status: "loading" }
  | { status: "ok"; events: EventSummary[] }
  | { status: "error"; error: ApiError };

export function useEventsData() {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const events = await getEvents();
      setState({ status: "ok", events });
    } catch (e) {
      setState({
        status: "error",
        error: e instanceof ApiError ? e : new ApiError("network", "Couldn't reach the server"),
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { state, retry: load };
}
