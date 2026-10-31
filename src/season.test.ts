import { describe, expect, test } from "vitest";
import { isHalloween } from "./season.ts";

describe("isHalloween", () => {
  test("returns true on October 31", () => {
    expect(isHalloween(new Date(2026, 9, 31))).toBe(true);
  });

  test("returns true on October 31 of another year", () => {
    expect(isHalloween(new Date(2027, 9, 31, 23, 59))).toBe(true);
  });

  test("returns false on the days around October 31", () => {
    expect(isHalloween(new Date(2026, 9, 30, 23, 59))).toBe(false);
    expect(isHalloween(new Date(2026, 10, 1))).toBe(false);
  });

  test("returns false on the 31st of another month", () => {
    expect(isHalloween(new Date(2026, 11, 31))).toBe(false);
  });
});
