import { useEffect, useState } from "react";
import styles from "./App.module.css";
import ContributionsGrid, {
  type ContributionDay,
} from "./components/ContributionsGrid";
import StatusMessage from "./components/StatusMessage";
import UsernameForm from "./components/UsernameForm";

type FetchStatus = "loading" | "error" | null;

export default function App({
  username: initialUsername,
}: {
  username: string | undefined;
}) {
  const [username, setUsername] = useState(initialUsername);
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

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setUsername(params.get("username")?.trim());
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleSubmit = (value: string) => {
    setUsername(value);
    const url = new URL(window.location.href);
    url.searchParams.set("username", value);
    window.history.pushState(null, "", url);
  };

  return (
    <div className={styles.app}>
      <ContributionsGrid contributions={contributions} />
      <UsernameForm
        initialUsername={username}
        loading={status === "loading"}
        onSubmit={handleSubmit}
      />
      {username && status === "error" && (
        <StatusMessage
          message={`could not load contributions for "${username}"`}
        />
      )}
    </div>
  );
}
