import { useSearchParams } from "react-router";
import ContributionsGrid from "../components/ContributionsGrid";
import StatusMessage from "../components/StatusMessage";
import { useContributions } from "../hooks/useContributions";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username")?.trim();
  const { contributions, message, isError } = useContributions(username);

  return (
    <div className={styles.page}>
      <ContributionsGrid contributions={contributions} />
      {message && <StatusMessage message={message} isError={isError} />}
    </div>
  );
}
