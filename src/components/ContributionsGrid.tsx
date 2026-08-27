import styles from "./ContributionsGrid.module.css";

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAY_LABELS: [row: number, text: string][] = [
  [1, "Mon"],
  [3, "Wed"],
  [5, "Fri"],
];

const LEVELS = [0, 1, 2, 3, 4] as const;

interface Cell {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
}

interface MonthLabel {
  column: number;
  text: string;
}

export function buildGrid(contributions: ContributionDay[], today: Date) {
  const byDate = new Map(contributions.map((day) => [day.date, day]));
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() - 52 * 7);

  const weeks: Cell[][] = [];
  const monthLabels: MonthLabel[] = [];
  let lastMonth = -1;

  for (let column = 0; column < 53; column++) {
    const week: Cell[] = [];
    for (let row = 0; row < 7; row++) {
      const date = new Date(start);
      date.setDate(start.getDate() + column * 7 + row);
      const key = `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      week.push({
        date: key,
        level: date > today ? 0 : (byDate.get(key)?.level ?? 0),
      });
      if (date.getDate() === 1 && date.getMonth() !== lastMonth) {
        monthLabels.push({ column, text: MONTHS[date.getMonth()] });
        lastMonth = date.getMonth();
      }
    }
    weeks.push(week);
  }

  return { weeks, monthLabels };
}

function levelClass(level: 0 | 1 | 2 | 3 | 4) {
  const classes: Record<0 | 1 | 2 | 3 | 4, string> = {
    0: styles.level0,
    1: styles.level1,
    2: styles.level2,
    3: styles.level3,
    4: styles.level4,
  };
  return `${styles.cell} ${classes[level]}`;
}

export default function ContributionsGrid({
  contributions,
  today = new Date(),
}: {
  contributions: ContributionDay[];
  today?: Date;
}) {
  const { weeks, monthLabels } = buildGrid(contributions, today);

  return (
    <div className={styles.wrapper}>
      <div className={styles.monthLabels}>
        {monthLabels.map(({ column, text }) => (
          <span key={column} style={{ gridColumnStart: column + 1 }}>
            {text}
          </span>
        ))}
      </div>
      <div className={styles.body}>
        <div className={styles.dayLabels}>
          {DAY_LABELS.map(([row, text]) => (
            <span key={row} style={{ gridRowStart: row + 1 }}>
              {text}
            </span>
          ))}
        </div>
        <div className={styles.cells}>
          {weeks.flat().map((cell) => (
            <div key={cell.date} className={levelClass(cell.level)} />
          ))}
        </div>
      </div>
      <div className={styles.legend}>
        <span>Less</span>
        {LEVELS.map((level) => (
          <div key={level} className={levelClass(level)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
