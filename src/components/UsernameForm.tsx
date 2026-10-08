import styles from "./UsernameForm.module.css";

export default function UsernameForm({
  defaultUsername,
  loading,
  onSubmit,
}: {
  defaultUsername: string | undefined;
  loading: boolean;
  onSubmit: (username: string) => void;
}) {
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        const input = event.currentTarget.elements.namedItem(
          "username",
        ) as HTMLInputElement;
        const username = input.value.trim();
        if (username) {
          onSubmit(username);
        }
      }}
    >
      <input
        className={styles.input}
        type="text"
        name="username"
        placeholder="GitHub username"
        aria-label="GitHub username"
        defaultValue={defaultUsername}
        disabled={loading}
      />
      <button className={styles.button} type="submit" disabled={loading}>
        {loading ? "Loading…" : "View contributions"}
      </button>
    </form>
  );
}
