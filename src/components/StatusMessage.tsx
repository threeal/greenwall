import styles from "./StatusMessage.module.css";

export default function StatusMessage({
  message,
  isError,
}: {
  message: string;
  isError: boolean;
}) {
  return (
    <p
      className={`${styles.status} ${isError ? styles.error : styles.message}`}
    >
      {message}
    </p>
  );
}
