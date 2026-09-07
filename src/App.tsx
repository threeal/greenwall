import styles from "./App.module.css";
import ContributionsGrid from "./components/ContributionsGrid";
import StatusMessage from "./components/StatusMessage";
import { useContributions } from "./hooks/useContributions";

export default function App({ username }: { username: string | undefined }) {
  const { contributions, message, isError } = useContributions(username);

  return (
    <div className={styles.app}>
      <ContributionsGrid contributions={contributions} />
      {message && <StatusMessage message={message} isError={isError} />}
    </div>
  );
}
