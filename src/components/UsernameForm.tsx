import { useEffect, useState } from "react";
import styles from "./UsernameForm.module.css";

export default function UsernameForm({
  initialUsername,
  loading,
  onSubmit,
}: {
  initialUsername: string | undefined;
  loading: boolean;
  onSubmit: (username: string) => void;
}) {
  const [value, setValue] = useState(initialUsername ?? "");

  useEffect(() => {
    setValue(initialUsername ?? "");
  }, [initialUsername]);

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        const username = value.trim();
        if (username) {
          onSubmit(username);
        }
      }}
    >
      <input
        className={styles.input}
        type="text"
        placeholder="GitHub username"
        aria-label="GitHub username"
        value={value}
        disabled={loading}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
      <button className={styles.button} type="submit" disabled={loading}>
        {loading ? "Loading…" : "View contributions"}
      </button>
    </form>
  );
}
