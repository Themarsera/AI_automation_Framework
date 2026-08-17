/**
 * Resolve secrets from environment variables.
 * In CI, inject via secrets manager / GitHub Actions secrets.
 */

export type Auth =
  | { type: 'bearer'; token: string }
  | { type: 'basic'; username: string; password: string }
  | { type: 'oauth2'; accessToken: string };

export function getEnvApiAuth(): Auth | undefined {
  const bearer = getBearerToken();
  if (bearer) { return { type: 'bearer', token: bearer }; }

  const basic = getBasicAuth();
  if (basic) { return { type: 'basic', username: basic.username, password: basic.password }; }

  const oauth = process.env.API_OAUTH2_ACCESS_TOKEN?.trim();
  if (oauth) { return { type: 'oauth2', accessToken: oauth }; }

  return undefined;
}

export function getBearerToken(): string | undefined {
  return process.env.API_BEARER_TOKEN;
}

export function getBasicAuth(): { username: string; password: string } | undefined {
  const username = process.env.API_BASIC_USER;
  const password = process.env.API_BASIC_PASS;
  if (!username || !password) { return undefined; }
  return { username, password };
}

export function maskSecret(value: string | undefined, visible = 4): string {
  if (!value) { return ''; }
  if (value.length <= visible) { return '****'; }
  return `${value.slice(0, visible)}****`;
}
