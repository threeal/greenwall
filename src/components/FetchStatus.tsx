import styles from "./FetchStatus.module.css";

/**
 * Renders the status of fetching a user's contributions below the page content, or nothing when idle.
 * @param props - The component props.
 * @param props.username - The username being fetched.
 * @param props.loading - Whether the contributions are still loading.
 * @param props.error - Whether the last fetch failed.
 * @returns A status element.
 */
export default function FetchStatus({
  username,
  loading,
  error,
}: {
  username: string;
  loading: boolean;
  error: boolean;
}) {
  if (loading) {
    return (
      <span role="status" className={styles.status}>
        loading contributions for <strong>{username}</strong>…
      </span>
    );
  }
  return (
    <span
      role="status"
      className={error ? `${styles.status} ${styles.error}` : styles.status}
    >
      {error && (
        <>
          could not load contributions for <strong>{username}</strong>
        </>
      )}
    </span>
  );
}
