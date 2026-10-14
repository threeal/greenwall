import { Suspense, use, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ContributionsGrid from "../components/ContributionsGrid";
import ErrorMessage from "../components/ErrorMessage";
import UsernameForm from "../components/UsernameForm";
import type { ContributionDay } from "../types";
import styles from "./HomePage.module.css";

type ContributionResult =
  | { contributions: ContributionDay[]; error: false }
  | { contributions: ContributionDay[]; error: true };

async function fetchContributions(
  username: string,
): Promise<ContributionResult> {
  try {
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`,
    );
    if (!response.ok) {
      throw new Error();
    }
    const data = (await response.json()) as {
      contributions: ContributionDay[];
    };
    return { contributions: data.contributions, error: false };
  } catch {
    return { contributions: [], error: true };
  }
}

function HomePageContent({
  username,
  contributions,
  loading,
  error,
}: {
  username: string | undefined;
  contributions: ContributionDay[];
  loading: boolean;
  error: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <ContributionsGrid contributions={contributions} />
      <UsernameForm
        key={username}
        defaultUsername={username}
        loading={loading}
        onSubmit={(value) => {
          void navigate(`/${encodeURIComponent(value)}`);
        }}
      />
      {username && error && (
        <ErrorMessage
          message={`could not load contributions for "${username}"`}
        />
      )}
    </div>
  );
}

function ResolvedHomePage({
  username,
  promise,
}: {
  username: string;
  promise: Promise<ContributionResult>;
}) {
  const result = use(promise);

  return (
    <HomePageContent
      username={username}
      contributions={result.contributions}
      loading={false}
      error={result.error}
    />
  );
}

function LoadedHomePage({ username }: { username: string }) {
  const [promise] = useState(() => fetchContributions(username));

  return (
    <Suspense
      fallback={
        <HomePageContent
          username={username}
          contributions={[]}
          loading
          error={false}
        />
      }
    >
      <ResolvedHomePage username={username} promise={promise} />
    </Suspense>
  );
}

export default function HomePage() {
  const { username } = useParams();

  if (!username) {
    return (
      <HomePageContent
        username={undefined}
        contributions={[]}
        loading={false}
        error={false}
      />
    );
  }

  return <LoadedHomePage key={username} username={username} />;
}
