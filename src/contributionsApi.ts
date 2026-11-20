import * as v from "valibot";
import { type ContributionDay, ContributionDaySchema } from "./types.ts";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const CONTRIBUTIONS_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

const ContributionLevelSchema = v.picklist([
  "NONE",
  "FIRST_QUARTILE",
  "SECOND_QUARTILE",
  "THIRD_QUARTILE",
  "FOURTH_QUARTILE",
]);

const CONTRIBUTION_LEVELS: Record<
  v.InferOutput<typeof ContributionLevelSchema>,
  ContributionDay["level"]
> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const ContributionsQueryResponseSchema = v.object({
  data: v.object({
    user: v.nullable(
      v.object({
        contributionsCollection: v.object({
          contributionCalendar: v.object({
            weeks: v.array(
              v.object({
                contributionDays: v.array(
                  v.object({
                    date: v.string(),
                    contributionCount: v.number(),
                    contributionLevel: ContributionLevelSchema,
                  }),
                ),
              }),
            ),
          }),
        }),
      }),
    ),
  }),
});

const JogruberResponseSchema = v.object({
  contributions: v.array(ContributionDaySchema),
});

/**
 * Parses an API response's body with a schema.
 * @param api - The API's name, for the error message.
 * @param schema - The schema the body should match.
 * @param body - The response's parsed JSON body.
 * @returns The parsed body.
 * @throws If the body doesn't match the schema.
 */
export function parseResponseBody<TSchema extends v.GenericSchema>(
  api: string,
  schema: TSchema,
  body: unknown,
): v.InferOutput<TSchema> {
  const result = v.safeParse(schema, body);
  if (!result.success) {
    throw new Error(
      `${api} API responded with an unexpected body:\n${v.summarize(result.issues)}`,
    );
  }
  return result.output;
}

/**
 * Sends a query to the GitHub GraphQL API.
 * @param token - The GitHub token to authenticate with.
 * @param body - The request body.
 * @param body.query - The GraphQL query.
 * @param body.variables - The query's variables, if any.
 * @returns The response.
 */
function queryGitHub(
  token: string,
  body: { query: string; variables?: Record<string, unknown> },
) {
  return fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

/**
 * Fetches a user's last year of contributions from the jogruber contributions API.
 * @param username - The GitHub username.
 * @returns The user's contributions.
 * @throws If the request fails, the user doesn't exist, or the response has an unexpected body.
 */
export async function fetchJogruberContributions(
  username: string,
): Promise<ContributionDay[]> {
  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
  );
  if (!response.ok) {
    throw new Error(`jogruber API responded with ${String(response.status)}`);
  }
  const { contributions } = parseResponseBody(
    "jogruber",
    JogruberResponseSchema,
    await response.json(),
  );
  return contributions;
}

/**
 * Fetches a user's last year of contributions from the GitHub GraphQL API.
 * @param username - The GitHub username.
 * @param token - The GitHub token to authenticate with.
 * @returns The user's contributions.
 * @throws If the request fails, GitHub rejects the token, the user doesn't exist, or the response has an unexpected body.
 */
export async function fetchGitHubContributions(
  username: string,
  token: string,
): Promise<ContributionDay[]> {
  const response = await queryGitHub(token, {
    query: CONTRIBUTIONS_QUERY,
    variables: { login: username },
  });
  if (!response.ok) {
    throw new Error(`GitHub API responded with ${String(response.status)}`);
  }
  const { data } = parseResponseBody(
    "GitHub",
    ContributionsQueryResponseSchema,
    await response.json(),
  );
  if (data.user === null) {
    throw new Error(`GitHub user ${username} doesn't exist`);
  }
  return data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
    (week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: CONTRIBUTION_LEVELS[day.contributionLevel],
      })),
  );
}

/**
 * Checks whether GitHub accepts a token.
 * @param token - The GitHub token to check.
 * @returns Whether a request authenticated with the token succeeds.
 */
export async function checkGitHubToken(token: string): Promise<boolean> {
  try {
    const response = await queryGitHub(token, {
      query: "{ viewer { login } }",
    });
    return response.ok;
  } catch {
    return false;
  }
}
