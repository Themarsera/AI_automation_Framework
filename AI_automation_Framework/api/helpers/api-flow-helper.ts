import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { z } from 'zod';
import { expect } from '@playwright/test';

import { parseResponseJsonWithSchema } from './schema-validation';
import { RestClient, type Auth, type MultipartField } from '../clients/rest.client';
import { TIMEOUTS } from '../../utils/constants/timeouts';

export type RetryOptions = {
  retries?: number;
  delayMs?: number;
  /** Return true to retry (overrides default status-based retry when provided). */
  shouldRetry?: (response: APIResponse, attempt: number) => boolean | Promise<boolean>;
};

export type PollUntilOptions = {
  timeoutMs?: number;
  intervalMs?: number;
};

/**
 * Higher-level REST flows on top of {@link RestClient}: JSON helpers, asserts, retry, polling, GraphQL.
 */
export class ApiFlowHelper extends RestClient {
  constructor(
    request: APIRequestContext,
    baseUrl: string,
    private readonly defaultAuth?: Auth
  ) {
    super(request, baseUrl);
  }

  defaultAuthorization(): Auth | undefined {
    return this.defaultAuth;
  }

  async parseJson<T>(res: APIResponse): Promise<T> {
    return res.json() as Promise<T>;
  }

  async parseText(res: APIResponse): Promise<string> {
    return res.text();
  }

  responseHeader(res: APIResponse, name: string): string | null {
    return res.headers()[name.toLowerCase()] ?? null;
  }

  /** Asserts HTTP OK without consuming body on success (so `json()` still works). */
  async assertOk(res: APIResponse, hint?: string): Promise<APIResponse> {
    if (res.ok()) { return res; }
    const body = await res.text().catch(() => '');
    throw new Error(`${hint ?? 'HTTP'} failed: ${res.status()} ${body}`);
  }

  async assertStatus(res: APIResponse, status: number, hint?: string): Promise<APIResponse> {
    if (res.status() === status) { return res; }
    const body = await res.text().catch(() => '');
    throw new Error(`${hint ?? 'status'} expected ${status}, got ${res.status()} ${body}`);
  }

  async getJson<T>(path: string, auth?: Auth): Promise<T> {
    const res = await this.assertOk(await this.get(path, auth ?? this.defaultAuth));
    return this.parseJson<T>(res);
  }

  async postJson<T>(path: string, body: unknown, auth?: Auth): Promise<T> {
    const res = await this.assertOk(await this.post(path, body, auth ?? this.defaultAuth));
    return this.parseJson<T>(res);
  }

  async patchJson<T>(path: string, body: unknown, auth?: Auth): Promise<T> {
    const res = await this.assertOk(await this.patch(path, body, auth ?? this.defaultAuth));
    return this.parseJson<T>(res);
  }

  async putJson<T>(path: string, body: unknown, auth?: Auth): Promise<T> {
    const res = await this.assertOk(await this.put(path, body, auth ?? this.defaultAuth));
    return this.parseJson<T>(res);
  }

  async getJsonValidating<Output>(
    path: string,
    schema: z.ZodType<Output>,
    auth?: Auth
  ): Promise<Output> {
    const res = await this.assertOk(await this.get(path, auth ?? this.defaultAuth));
    return parseResponseJsonWithSchema(res, schema);
  }

  async postJsonValidating<Output>(
    path: string,
    body: unknown,
    schema: z.ZodType<Output>,
    auth?: Auth
  ): Promise<Output> {
    const res = await this.assertOk(await this.post(path, body, auth ?? this.defaultAuth));
    return parseResponseJsonWithSchema(res, schema);
  }

  async graphqlValidating<Output>(
    path: string,
    query: string,
    schema: z.ZodType<Output>,
    variables?: Record<string, unknown>,
    auth?: Auth
  ): Promise<Output> {
    return this.postJsonValidating(path, { query, variables: variables ?? {} }, schema, auth);
  }

  async parseJsonValidated<Output>(
    res: APIResponse,
    schema: z.ZodType<Output>
  ): Promise<Output> {
    const ok = await this.assertOk(res);
    return parseResponseJsonWithSchema(ok, schema);
  }

  async deleteExpectOk(path: string, auth?: Auth, okStatuses: number[] = [200, 202, 204]): Promise<void> {
    const res = await this.delete(path, auth ?? this.defaultAuth);
    expect(okStatuses.includes(res.status()), `DELETE failed: ${res.status()}`).toBeTruthy();
  }

  async graphql<T>(
    path: string,
    query: string,
    variables?: Record<string, unknown>,
    auth?: Auth
  ): Promise<T> {
    return this.postJson<T>(
      path,
      { query, variables: variables ?? {} },
      auth ?? this.defaultAuth
    );
  }

  async postMultipartExpectOk(
    path: string,
    fields: Record<string, MultipartField>,
    auth?: Auth
  ): Promise<APIResponse> {
    return this.assertOk(await this.postMultipart(path, fields, auth ?? this.defaultAuth));
  }

  async getExpectOk(path: string, auth?: Auth): Promise<APIResponse> {
    return this.assertOk(await this.get(path, auth ?? this.defaultAuth));
  }

  async postExpectOk(path: string, body: unknown, auth?: Auth): Promise<APIResponse> {
    return this.assertOk(await this.post(path, body, auth ?? this.defaultAuth));
  }

  async withRetry(fn: () => Promise<APIResponse>, opts?: RetryOptions): Promise<APIResponse> {
    const retries = opts?.retries ?? 3;
    const delayMs = opts?.delayMs ?? TIMEOUTS.pollingInterval;
    let last: APIResponse | undefined;
    for (let attempt = 0; attempt <= retries; attempt++) {
      last = await fn();
      const defaultRetry =
        !last.ok() && [408, 425, 429, 500, 502, 503, 504].includes(last.status());
      const retry = opts?.shouldRetry ? await opts.shouldRetry(last, attempt) : defaultRetry;
      if (!retry || attempt === retries) { return last; }
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return last!;
  }

  async pollUntilJson<T>(
    fn: () => Promise<APIResponse>,
    predicate: (data: T) => boolean,
    opts?: PollUntilOptions
  ): Promise<T> {
    const deadline = Date.now() + (opts?.timeoutMs ?? TIMEOUTS.medium);
    const interval = opts?.intervalMs ?? TIMEOUTS.pollingInterval;
    let lastErr: unknown;
    while (Date.now() < deadline) {
      try {
        const res = await fn();
        if (!res.ok()) {
          await new Promise((r) => setTimeout(r, interval));
          continue;
        }
        const data = (await res.json()) as T;
        if (predicate(data)) { return data; }
      } catch (e) {
        lastErr = e;
      }
      await new Promise((r) => setTimeout(r, interval));
    }
    throw new Error(`pollUntilJson timed out${lastErr ? `: ${String(lastErr)}` : ''}`);
  }

  async extractBearerFromJsonBody(res: APIResponse): Promise<string | undefined> {
    if (!res.ok()) { return undefined; }
    try {
      const j = (await res.json()) as Record<string, unknown>;
      let token: unknown = j.access_token ?? j.accessToken ?? j.token;
      if (token === undefined && j.data && typeof j.data === 'object') {
        token = (j.data as Record<string, unknown>).token;
      }
      return typeof token === 'string' ? token : undefined;
    } catch {
      return undefined;
    }
  }
}
