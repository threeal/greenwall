import styles from "./ErrorMessage.module.css";

/**
 * Renders an error message below the page content.
 * @param props - The component props.
 * @param props.message - The error message to display.
 * @returns A paragraph element.
 */
export default function ErrorMessage({ message }: { message: string }) {
  return <p className={styles.error}>{message}</p>;
}
