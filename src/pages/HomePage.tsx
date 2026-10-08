import { useNavigate, useParams } from "react-router";
import ContributionsGrid from "../components/ContributionsGrid";
import ErrorMessage from "../components/ErrorMessage";
import UsernameForm from "../components/UsernameForm";
import { useContributions } from "../hooks/useContributions";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { contributions, status } = useContributions(username);

  return (
    <div className={styles.page}>
      <ContributionsGrid contributions={contributions} />
      <UsernameForm
        key={username}
        defaultUsername={username}
        loading={status === "loading"}
        onSubmit={(value) => {
          void navigate(`/${encodeURIComponent(value)}`);
        }}
      />
      {username && status === "error" && (
        <ErrorMessage
          message={`could not load contributions for "${username}"`}
        />
      )}
    </div>
  );
}
