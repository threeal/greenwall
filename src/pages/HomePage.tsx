import { Suspense, use, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ContributionsGrid from "../components/ContributionsGrid.tsx";
import ErrorMessage from "../components/ErrorMessage.tsx";
import UsernameForm from "../components/UsernameForm.tsx";
import type { ContributionDay } from "../types.ts";
import styles from "./HomePage.module.css";

type ContributionResult =
  { contributions: ContributionDay[] } | { error: true };

/**
 * Fetches a user's contributions from the jogruber contributions API.
 * @param username - The GitHub username, or undefined when none is given.
 * @returns The user's contributions, none without a username, or an error result if the request fails.
 */
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

/**
 * Renders the home page's contributions grid, username form, and error message.
 * @param props - The component props.
 * @param props.username - The username from the path, if any.
 * @param props.contributions - The contribution days to display.
 * @param props.loading - Whether contributions are still loading.
 * @param props.error - Whether loading the contributions failed.
 * @returns The home page content.
 */
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

/**
 * Renders the home page content once the contributions promise resolves.
 * @param props - The component props.
 * @param props.username - The username from the path, if any.
 * @param props.promise - The pending result of fetching the user's contributions.
 * @returns The home page content for the resolved result.
 */
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

/**
 * Starts fetching a user's contributions and shows the loading state until they resolve.
 * @param props - The component props.
 * @param props.username - The username from the path, if any.
 * @returns The home page content, wrapped in a Suspense boundary.
 */
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

/**
 * Renders the home page for the username in the path, reloading when the username changes.
 * @returns The home page content.
 */
export default function HomePage() {
  const { username } = useParams();

  return <LoadedHomePage key={username} username={username} />;
}
