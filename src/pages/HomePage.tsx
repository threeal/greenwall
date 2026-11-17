import { Suspense, use, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router";
import ContributionsGrid from "../components/ContributionsGrid.tsx";
import FetchStatus from "../components/FetchStatus.tsx";
import UsernameForm from "../components/UsernameForm.tsx";
import {
  fetchGitHubContributions,
  fetchJogruberContributions,
} from "../contributionsApi.ts";
import {
  loadStoredContributions,
  storeContributions,
} from "../contributionsStorage.ts";
import { loadSettings, subscribeSettings } from "../settingsStorage.ts";
import type { ContributionDay } from "../types.ts";
import styles from "./HomePage.module.css";

type ContributionResult =
  { contributions: ContributionDay[] } | { error: true };

/**
 * Fetches a user's last year of contributions, storing them for later page loads.
 * With a token, they're fetched from the GitHub GraphQL API, falling back to the jogruber contributions API if that fails.
 * @param username - The GitHub username, or undefined when none is given.
 * @param token - The GitHub token to fetch with, if any.
 * @returns The user's contributions, none without a username, or an error result if the request fails.
 */
async function fetchContributions(
  username: string | undefined,
  token: string | undefined,
): Promise<ContributionResult> {
  if (!username) {
    return { contributions: [] };
  }
  try {
    let contributions: ContributionDay[] | undefined;
    if (token !== undefined) {
      contributions = await fetchGitHubContributions(username, token).catch(
        () => undefined,
      );
    }
    contributions ??= await fetchJogruberContributions(username);
    storeContributions(username, contributions);
    return { contributions };
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
      <ContributionsGrid
        contributions={contributions}
        today={today}
        showTotal={loaded && Boolean(username)}
      />
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
 * @param props.token - The GitHub token to fetch with, if any.
 * @returns The home page content, wrapped in a Suspense boundary.
 */
function LoadedHomePage({
  username,
  token,
}: {
  username: string | undefined;
  token: string | undefined;
}) {
  const [promise, setPromise] = useState(() =>
    fetchContributions(username, token),
  );
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
      setPromise(fetchContributions(username, token));
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
 * Renders the home page for the username in the path, reloading when the username or the stored GitHub token changes.
 * @returns The home page content.
 */
export default function HomePage() {
  const { username } = useParams();
  const token = useSyncExternalStore(
    subscribeSettings,
    () => loadSettings().token,
  );

  return (
    <LoadedHomePage
      key={JSON.stringify([username, token])}
      username={username}
      token={token}
    />
  );
}
