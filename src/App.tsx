import { useEffect, useState } from "react";
import styles from "./App.module.css";
import ContributionsGrid, {
  type ContributionDay,
} from "./components/ContributionsGrid";
import StatusMessage from "./components/StatusMessage";

type FetchStatus = "loading" | "error" | null;

export default function App({ username }: { username: string | undefined }) {
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

  return (
    <div className={styles.app}>
      <ContributionsGrid contributions={contributions} />
      {message && (
        <StatusMessage message={message} isError={status === "error"} />
      )}
    </div>
  );
}
