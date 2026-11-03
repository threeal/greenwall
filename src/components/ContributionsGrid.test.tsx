import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import type { ContributionDay } from "../types.ts";
import styles from "./ContributionsGrid.module.css";
import ContributionsGrid, { buildGrid } from "./ContributionsGrid.tsx";

const TODAY = new Date(2026, 7, 24); // Monday, Aug 24 2026

test("buildGrid returns 53 weeks ending today, all level 0 when there is no data", () => {
  const { weeks, monthLabels } = buildGrid([], TODAY);

  expect(weeks).toHaveLength(53);
  expect(weeks.map((week) => week.length)).toEqual([
    ...Array.from({ length: 52 }, () => 7),
    2,
  ]);
  expect(weeks.at(-1)?.at(-1)?.date).toBe("2026-08-24");
  for (const week of weeks) {
    for (const cell of week) {
      expect(cell.level).toBe(0);
    }
  }
  expect(monthLabels.some((label) => label.text === "Aug")).toBe(true);
});

test("buildGrid maps contribution levels onto matching dates and leaves out dates after today", () => {
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
  expect(byDate.has("2026-08-26")).toBe(false);
});

test("buildGrid totals the contributions on the grid's days only", () => {
  const contributions: ContributionDay[] = [
    { date: "2025-08-23", count: 100, level: 4 }, // before the grid's first day, must not count
    { date: "2025-08-24", count: 3, level: 1 },
    { date: "2026-08-24", count: 5, level: 3 },
    { date: "2026-08-25", count: 100, level: 4 }, // after TODAY, must not count
  ];

  expect(buildGrid(contributions, TODAY).total).toBe(8);
});

test("buildGrid leaves out the month label for a first of the month after today", () => {
  const { monthLabels } = buildGrid([], new Date(2026, 7, 31)); // Monday, Aug 31 2026, the day before Tuesday, Sep 1

  expect(monthLabels.at(-1)?.text).toBe("Aug");
});

test("buildGrid describes each day up to today in a tooltip", () => {
  const contributions: ContributionDay[] = [
    { date: "2026-08-01", count: 1, level: 1 },
    { date: "2026-08-22", count: 7, level: 3 },
  ];

  const { weeks } = buildGrid(contributions, TODAY);
  const byDate = new Map(weeks.flat().map((cell) => [cell.date, cell.tooltip]));

  expect(byDate.get("2026-08-01")).toBe("1 contribution on August 1st.");
  expect(byDate.get("2026-08-02")).toBe("No contributions on August 2nd.");
  expect(byDate.get("2026-08-03")).toBe("No contributions on August 3rd.");
  expect(byDate.get("2026-08-12")).toBe("No contributions on August 12th.");
  expect(byDate.get("2026-08-22")).toBe("7 contributions on August 22nd.");
  expect(byDate.has("2026-08-25")).toBe(false);
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
  expect(document.querySelectorAll(`.${styles.cell}`)).toHaveLength(
    52 * 7 + 2 + 5,
  );
  expect(document.querySelectorAll(`.${styles.level0}`)).toHaveLength(
    52 * 7 + 2 + 1,
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

test("shows the total contributions on the grid when asked to", async () => {
  const contributions: ContributionDay[] = [
    { date: "2026-08-20", count: 1234, level: 4 },
    { date: "2026-08-24", count: 1, level: 1 },
  ];
  const screen = await render(
    <ContributionsGrid contributions={contributions} today={TODAY} showTotal />,
  );
  await expect
    .element(screen.getByText("1,235 contributions in the last year"))
    .toBeVisible();
});

test("shows a single contribution in the total as singular", async () => {
  const contributions: ContributionDay[] = [
    { date: "2026-08-24", count: 1, level: 1 },
  ];
  const screen = await render(
    <ContributionsGrid contributions={contributions} today={TODAY} showTotal />,
  );
  await expect
    .element(screen.getByText("1 contribution in the last year"))
    .toBeVisible();
});

test("hides the total contributions by default", async () => {
  const screen = await render(
    <ContributionsGrid contributions={[]} today={TODAY} />,
  );
  await expect.element(screen.getByText("Less")).toBeVisible();
  await expect
    .element(screen.getByText(/in the last year/))
    .not.toBeInTheDocument();
});

test("attaches a tooltip describing the day to a cell", async () => {
  const contributions: ContributionDay[] = [
    { date: "2026-08-24", count: 10, level: 3 },
  ];
  const screen = await render(
    <ContributionsGrid contributions={contributions} today={TODAY} />,
  );
  await expect.element(screen.getByText("Aug")).toBeVisible();
  expect(
    document.querySelector('[data-tooltip="10 contributions on August 24th."]'),
  ).not.toBeNull();
});
