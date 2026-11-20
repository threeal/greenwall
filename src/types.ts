import * as v from "valibot";

export const ContributionDaySchema = v.object({
  date: v.string(),
  count: v.number(),
  level: v.picklist([0, 1, 2, 3, 4]),
});

export type ContributionDay = v.InferOutput<typeof ContributionDaySchema>;
