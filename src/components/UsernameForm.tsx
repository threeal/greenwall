import styles from "./UsernameForm.module.css";

/**
 * Renders a GitHub username input with a submit button.
 * @param props - The component props.
 * @param props.value - The text in the input.
 * @param props.onValueChange - Called with the new text when the input changes.
 * @param props.loadedUsername - The user whose contributions are loaded, which turns the button into a refresh.
 * @param props.loadingUsername - The user whose contributions are loading, which disables the button for that user.
 * @param props.onSubmit - Called with the trimmed username when a non-empty one is submitted.
 * @returns A form element.
 */
export default function UsernameForm({
  value,
  onValueChange,
  loadedUsername,
  loadingUsername,
  onSubmit,
}: {
  value: string;
  onValueChange: (value: string) => void;
  loadedUsername: string | undefined;
  loadingUsername: string | undefined;
  onSubmit: (username: string) => void;
}) {
  const username = value.trim();

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
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
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value);
        }}
      />
      <button
        className={styles.button}
        type="submit"
        disabled={username === loadingUsername}
      >
        {username === loadedUsername ? "Refresh" : "View contributions"}
      </button>
    </form>
  );
}
