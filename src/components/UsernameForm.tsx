import styles from "./UsernameForm.module.css";

/**
 * Renders a GitHub username input with a submit button.
 * @param props - The component props.
 * @param props.defaultUsername - The username initially shown in the input.
 * @param props.loading - Whether contributions are loading, which disables the form.
 * @param props.onSubmit - Called with the trimmed username when a non-empty one is submitted.
 * @returns A form element.
 */
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
