import { Suspense, use, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ContributionsGrid from "../components/ContributionsGrid";
import ErrorMessage from "../components/ErrorMessage";
import UsernameForm from "../components/UsernameForm";
import type { ContributionDay } from "../types";
import styles from "./HomePage.module.css";

type ContributionResult =
  { contributions: ContributionDay[] } | { error: true };

async function fetchContributions(
  username: string | undefined,
): Promise<ContributionResult> {
  if (!username) {
    return { contributions: [] };
  }
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
    return { contributions: data.contributions };
  } catch {
    return { error: true };
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
  const [today] = useState(() => new Date());

  return (
    <div className={styles.page}>
      <ContributionsGrid contributions={contributions} today={today} />
      <UsernameForm
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
  username: string | undefined;
  promise: Promise<ContributionResult>;
}) {
  const result = use(promise);

  return (
    <HomePageContent
      username={username}
      contributions={"error" in result ? [] : result.contributions}
      loading={false}
      error={"error" in result}
    />
  );
}

function LoadedHomePage({ username }: { username: string | undefined }) {
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

  return <LoadedHomePage key={username} username={username} />;
}
