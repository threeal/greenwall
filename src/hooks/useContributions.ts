import { useEffect, useState } from "react";

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

type FetchStatus = "loading" | "error" | null;

export function useContributions(username: string | undefined) {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [status, setStatus] = useState<FetchStatus>(null);

  useEffect(() => {
    if (!username) {
      setStatus(null);
      return;
    }
    setStatus("loading");
    void fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`,
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
        setStatus("error");
      });
  }, [username]);

  const message = !username
    ? 'set the "username" search parameter to see contributions'
    : status === "loading"
      ? `loading contributions for "${username}"`
      : status === "error"
        ? `could not load contributions for "${username}"`
        : null;

  return { contributions, message, isError: status === "error" };
}
