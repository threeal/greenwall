import { useEffect, useState } from "react";

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export type FetchStatus = "loading" | "error" | null;

export function useContributions(username: string | undefined) {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [status, setStatus] = useState<FetchStatus>(null);

  useEffect(() => {
    if (!username) {
      setContributions([]);
      setStatus(null);
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    void fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error();
        }
        const data = (await response.json()) as {
          contributions: ContributionDay[];
        };
        setContributions(data.contributions);
        setStatus(null);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus("error");
        }
      });
    return () => {
      controller.abort();
    };
  }, [username]);

  return { contributions, status };
}
