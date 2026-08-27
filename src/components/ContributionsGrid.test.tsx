import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import ContributionsGrid, {
  buildGrid,
  type ContributionDay,
} from "./ContributionsGrid";
import styles from "./ContributionsGrid.module.css";

const TODAY = new Date(2026, 7, 24); // Monday, Aug 24 2026

test("buildGrid returns 53 weeks of 7 days, all level 0 when there is no data", () => {
  const { weeks, monthLabels } = buildGrid([], TODAY);

  expect(weeks).toHaveLength(53);
  for (const week of weeks) {
    expect(week).toHaveLength(7);
    for (const cell of week) {
      expect(cell.level).toBe(0);
    }
  }
  expect(monthLabels.some((label) => label.text === "Aug")).toBe(true);
});

test("buildGrid maps contribution levels onto matching dates and ignores dates after today", () => {
  const contributions: ContributionDay[] = [
    { date: "2026-08-20", count: 2, level: 2 },
    { date: "2026-08-24", count: 5, level: 3 },
    { date: "2026-08-26", count: 9, level: 4 }, // after TODAY, must not apply
  ];

  const { weeks } = buildGrid(contributions, TODAY);
  const byDate = new Map(weeks.flat().map((cell) => [cell.date, cell.level]));

  expect(byDate.get("2026-08-20")).toBe(2);
  expect(byDate.get("2026-08-24")).toBe(3);
  expect(byDate.get("2026-08-21")).toBe(0);
  expect(byDate.get("2026-08-26")).toBe(0);
});

test("renders an empty grid with month and day labels when there is no data", async () => {
  const screen = await render(
    <ContributionsGrid contributions={[]} today={TODAY} />,
  );
  await expect.element(screen.getByText("Mon")).toBeVisible();
  await expect.element(screen.getByText("Wed")).toBeVisible();
  await expect.element(screen.getByText("Fri")).toBeVisible();
  await expect.element(screen.getByText("Aug")).toBeVisible();
  await expect.element(screen.getByText("Less")).toBeVisible();
  await expect.element(screen.getByText("More")).toBeVisible();
  expect(document.querySelectorAll(`.${styles.cell}`)).toHaveLength(53 * 7 + 5);
  expect(document.querySelectorAll(`.${styles.level0}`)).toHaveLength(
    53 * 7 + 1,
  );
});

test("colors a cell according to the contribution level for its date", async () => {
  const contributions: ContributionDay[] = [
    { date: "2026-08-24", count: 10, level: 3 },
  ];
  const screen = await render(
    <ContributionsGrid contributions={contributions} today={TODAY} />,
  );
  await expect.element(screen.getByText("Aug")).toBeVisible();
  expect(document.querySelectorAll(`.${styles.level3}`)).toHaveLength(2);
});
