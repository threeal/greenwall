import { Suspense, use, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ContributionsGrid from "../components/ContributionsGrid.tsx";
import FetchStatus from "../components/FetchStatus.tsx";
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

interface HomePageContentProps {
  username: string | undefined;
  hasLoaded: boolean;
  input: string;
  onInputChange: (input: string) => void;
  onRefresh: (hasLoaded: boolean) => void;
}

/**
 * Renders the home page's contributions grid, username form, and fetch status.
 * @param props - The component props.
 * @param props.username - The username from the path, if any.
 * @param props.hasLoaded - Whether an earlier fetch for the username succeeded.
 * @param props.input - The text in the username input.
 * @param props.onInputChange - Called with the new text when the username input changes.
 * @param props.onRefresh - Called to refetch the contributions, with whether they loaded before.
 * @param props.result - The fetched contributions, or undefined while they are still loading.
 * @returns The home page content.
 */
function HomePageContent({
  username,
  hasLoaded,
  input,
  onInputChange,
  onRefresh,
  result,
}: HomePageContentProps & { result: ContributionResult | undefined }) {
  const navigate = useNavigate();
  const [today] = useState(() => new Date());
  const loaded =
    hasLoaded || (result !== undefined && "contributions" in result);

  return (
    <div className={styles.page}>
      <ContributionsGrid
        contributions={
          result && "contributions" in result ? result.contributions : []
        }
        today={today}
      />
      <UsernameForm
        value={input}
        onValueChange={onInputChange}
        loadedUsername={loaded ? username : undefined}
        loadingUsername={result ? undefined : username}
        onSubmit={(value) => {
          if (value === username) {
            onRefresh(loaded);
          } else {
            void navigate(`/${encodeURIComponent(value)}`);
          }
        }}
      />
      {username && (
        <FetchStatus
          username={username}
          loading={!result}
          error={result !== undefined && "error" in result}
        />
      )}
    </div>
  );
}

/**
 * Renders the home page content once the contributions promise resolves.
 * @param props - The component props, passed on to the home page content.
 * @param props.promise - The pending result of fetching the user's contributions.
 * @returns The home page content for the resolved result.
 */
function ResolvedHomePage({
  promise,
  ...props
}: HomePageContentProps & { promise: Promise<ContributionResult> }) {
  const result = use(promise);

  return <HomePageContent {...props} result={result} />;
}

/**
 * Starts fetching a user's contributions and shows the loading state until they resolve, refetching on refresh.
 * @param props - The component props.
 * @param props.username - The username from the path, if any.
 * @returns The home page content, wrapped in a Suspense boundary.
 */
function LoadedHomePage({ username }: { username: string | undefined }) {
  const [promise, setPromise] = useState(() => fetchContributions(username));
  const [hasLoaded, setHasLoaded] = useState(false);
  const [input, setInput] = useState(username ?? "");

  const props: HomePageContentProps = {
    username,
    hasLoaded,
    input,
    onInputChange: setInput,
    onRefresh: (loaded) => {
      setHasLoaded(loaded);
      setPromise(fetchContributions(username));
    },
  };

  return (
    <Suspense fallback={<HomePageContent {...props} result={undefined} />}>
      <ResolvedHomePage {...props} promise={promise} />
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
