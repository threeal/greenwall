import { useState, type KeyboardEvent } from "react";
import type { ContributionDay } from "../types.ts";
import styles from "./ContributionsGrid.module.css";

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

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MOVES: Partial<Record<string, [column: number, row: number]>> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

const LEVELS = [0, 1, 2, 3, 4] as const;

interface Cell {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  tooltip: string;
}

interface MonthLabel {
  column: number;
  text: string;
}

/**
 * Gets the English ordinal suffix for a day of the month.
 * @param day - The day of the month, from 1 to 31.
 * @returns The suffix, such as "st" for 1 or "th" for 11.
 */
function ordinalSuffix(day: number) {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Describes a day's contributions the way GitHub's grid tooltip does.
 * @param date - The day being described.
 * @param count - The number of contributions on that day.
 * @returns A sentence like "5 contributions on October 26th.".
 */
function describeDay(date: Date, count: number) {
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = `${month} ${String(date.getDate())}${ordinalSuffix(date.getDate())}`;
  if (count === 0) return `No contributions on ${day}.`;
  if (count === 1) return `1 contribution on ${day}.`;
  return `${String(count)} contributions on ${day}.`;
}

/**
 * Lays out a year of contributions as week columns ending on the week of `today`.
 * @param contributions - The contribution days to place on the grid.
 * @param today - The last day shown; later days in its week are left out.
 * @returns The grid's week columns, the month labels above them, and the total contributions on the grid's days.
 */
export function buildGrid(contributions: ContributionDay[], today: Date) {
  const byDate = new Map(contributions.map((day) => [day.date, day]));
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() - 52 * 7);

  const weeks: Cell[][] = [];
  const monthLabels: MonthLabel[] = [];
  let lastMonth = -1;
  let total = 0;

  for (let column = 0; column < 53; column++) {
    const week: Cell[] = [];
    for (let row = 0; row < 7; row++) {
      const date = new Date(start);
      date.setDate(start.getDate() + column * 7 + row);
      if (date > today) break;
      const key = `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const day = byDate.get(key);
      total += day?.count ?? 0;
      week.push({
        date: key,
        level: day?.level ?? 0,
        tooltip: describeDay(date, day?.count ?? 0),
      });
      if (date.getDate() === 1 && date.getMonth() !== lastMonth) {
        monthLabels.push({ column, text: MONTHS[date.getMonth()] });
        lastMonth = date.getMonth();
      }
    }
    weeks.push(week);
  }

  return { weeks, monthLabels, total };
}

/**
 * Describes the total contributions on the grid the way GitHub's graph does.
 * @param total - The total contributions on the grid's days.
 * @returns A phrase like "1,234 contributions in the last year".
 */
function describeTotal(total: number) {
  const noun = total === 1 ? "contribution" : "contributions";
  return `${total.toLocaleString("en-US")} ${noun} in the last year`;
}

/**
 * Gets the class names for a grid cell colored by its contribution level.
 * @param level - The contribution level, from 0 (none) to 4 (most).
 * @returns The cell's class names.
 */
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

/**
 * Renders a GitHub-style contributions grid with month and day labels and a legend.
 * The grid is a table with a row per weekday, and its cells can be moved between with the arrow keys.
 * @param props - The component props.
 * @param props.contributions - The contribution days to display.
 * @param props.today - The last day shown on the grid.
 * @param props.showTotal - Whether to show the total contributions on the grid next to the legend.
 * @returns The contributions grid element.
 */
export default function ContributionsGrid({
  contributions,
  today,
  showTotal = false,
}: {
  contributions: ContributionDay[];
  today: Date;
  showTotal?: boolean;
}) {
  const { weeks, monthLabels, total } = buildGrid(contributions, today);
  const [focused, setFocused] = useState<{ column: number; row: number }>();
  const current = focused ?? {
    column: weeks.length - 1,
    row: weeks[weeks.length - 1].length - 1,
  };

  /**
   * Moves the focus to the neighboring cell in the direction of an arrow key, if there is one.
   * @param event - The key event from within the grid.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const move = MOVES[event.key];
    if (!move) return;
    event.preventDefault();
    const column = current.column + move[0];
    const row = current.row + move[1];
    if (column < 0 || column >= weeks.length) return;
    if (row < 0 || row >= weeks[column].length) return;
    event.currentTarget.rows[row].cells[column + 1].focus();
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.monthLabels} aria-hidden="true">
        {monthLabels.map(({ column, text }) => (
          <span key={column} style={{ gridColumnStart: column + 1 }}>
            {text}
          </span>
        ))}
      </div>
      <table
        className={styles.cells}
        role="grid"
        aria-readonly="true"
        aria-label="Contributions"
        onKeyDown={handleKeyDown}
      >
        <tbody>
          {WEEKDAYS.map((weekday, row) => (
            <tr key={weekday}>
              <th scope="row" className={styles.dayLabel}>
                <span className={styles.srOnly}>{weekday}</span>
                {row % 2 === 1 && (
                  <span className={styles.dayLabelText} aria-hidden="true">
                    {weekday.slice(0, 3)}
                  </span>
                )}
              </th>
              {weeks
                .filter((week) => row < week.length)
                .map((week, column) => {
                  const cell = week[row];
                  const isCurrent =
                    column === current.column && row === current.row;
                  return (
                    <td
                      key={cell.date}
                      className={levelClass(cell.level)}
                      data-tooltip={cell.tooltip}
                      tabIndex={isCurrent ? 0 : -1}
                      onFocus={() => {
                        setFocused({ column, row });
                      }}
                    >
                      <span className={styles.srOnly}>{cell.tooltip}</span>
                    </td>
                  );
                })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.legend}>
        {showTotal && (
          <span className={styles.total}>{describeTotal(total)}</span>
        )}
        <span>Less</span>
        {LEVELS.map((level) => (
          <div key={level} className={levelClass(level)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
