import styles from "./StatusMessage.module.css";

export default function StatusMessage({ message }: { message: string }) {
  return <p className={styles.status}>{message}</p>;
}
