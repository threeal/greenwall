import { Suspense, use, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ContributionsGrid from "../components/ContributionsGrid.tsx";
import FetchStatus from "../components/FetchStatus.tsx";
import UsernameForm from "../components/UsernameForm.tsx";
import {
  loadStoredContributions,
  storeContributions,
} from "../contributionsStorage.ts";
import type { ContributionDay } from "../types.ts";
import styles from "./HomePage.module.css";

type ContributionResult =
  { contributions: ContributionDay[] } | { error: true };

/**
 * Fetches a user's contributions from the jogruber contributions API, storing them for later page loads.
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
    storeContributions(username, data.contributions);
    return { contributions: data.contributions };
  } catch {
    return { error: true };
  }
}

interface HomePageContentProps {
  username: string | undefined;
  input: string;
  onInputChange: (input: string) => void;
  onRefresh: (loadedContributions: ContributionDay[] | undefined) => void;
}

/**
 * Renders the home page's contributions grid, username form, and fetch status.
 * @param props - The component props.
 * @param props.username - The username from the path, if any.
 * @param props.input - The text in the username input.
 * @param props.onInputChange - Called with the new text when the username input changes.
 * @param props.onRefresh - Called to refetch the contributions, with the ones currently shown.
 * @param props.contributions - The contributions to show in the grid.
 * @param props.loaded - Whether the contributions were loaded for the username, which turns the submit button into a refresh.
 * @param props.loading - Whether the contributions are still loading.
 * @param props.error - Whether the latest fetch failed.
 * @returns The home page content.
 */
function HomePageContent({
  username,
  input,
  onInputChange,
  onRefresh,
  contributions,
  loaded,
  loading,
  error,
}: HomePageContentProps & {
  contributions: ContributionDay[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
}) {
  const navigate = useNavigate();
  const [today] = useState(() => new Date());

  return (
    <div className={styles.page}>
      <ContributionsGrid contributions={contributions} today={today} />
      <UsernameForm
        value={input}
        onValueChange={onInputChange}
        loadedUsername={loaded ? username : undefined}
        loadingUsername={loading ? username : undefined}
        onSubmit={(value) => {
          if (value === username) {
            onRefresh(loaded ? contributions : undefined);
          } else {
            void navigate(`/${encodeURIComponent(value)}`);
          }
        }}
      />
      {username && (
        <FetchStatus username={username} loading={loading} error={error} />
      )}
    </div>
  );
}

/**
 * Renders the home page content once the contributions promise resolves.
 * @param props - The component props, passed on to the home page content.
 * @param props.loadedContributions - The contributions from an earlier fetch for the username, kept shown if this one fails.
 * @param props.promise - The pending result of fetching the user's contributions.
 * @returns The home page content for the resolved result.
 */
function ResolvedHomePage({
  loadedContributions,
  promise,
  ...props
}: HomePageContentProps & {
  loadedContributions: ContributionDay[] | undefined;
  promise: Promise<ContributionResult>;
}) {
  const result = use(promise);

  return "contributions" in result ? (
    <HomePageContent
      {...props}
      contributions={result.contributions}
      loaded={true}
      loading={false}
      error={false}
    />
  ) : (
    <HomePageContent
      {...props}
      contributions={loadedContributions ?? []}
      loaded={loadedContributions !== undefined}
      loading={false}
      error={true}
    />
  );
}

/**
 * Starts fetching a user's contributions and shows the loading state until they resolve, refetching on refresh.
 * Until the first fetch resolves, the contributions stored by an earlier page load are shown, if any.
 * @param props - The component props.
 * @param props.username - The username from the path, if any.
 * @returns The home page content, wrapped in a Suspense boundary.
 */
function LoadedHomePage({ username }: { username: string | undefined }) {
  const [promise, setPromise] = useState(() => fetchContributions(username));
  const [loadedContributions, setLoadedContributions] = useState(() =>
    username ? loadStoredContributions(username) : undefined,
  );
  const [input, setInput] = useState(username ?? "");

  const props: HomePageContentProps = {
    username,
    input,
    onInputChange: setInput,
    onRefresh: (contributions) => {
      setLoadedContributions(contributions);
      setPromise(fetchContributions(username));
    },
  };

  return (
    <Suspense
      fallback={
        <HomePageContent
          {...props}
          contributions={loadedContributions ?? []}
          loaded={loadedContributions !== undefined}
          loading={true}
          error={false}
        />
      }
    >
      <ResolvedHomePage
        {...props}
        loadedContributions={loadedContributions}
        promise={promise}
      />
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
