import type { APIRequestContext, APIResponse } from '@playwright/test';

export type Auth =
  | { type: 'bearer'; token: string }
  | { type: 'basic'; username: string; password: string }
  | { type: 'oauth2'; accessToken: string };

/** Single multipart field for {@link RestClient.postMultipart}. */
export type MultipartField =
  | string
  | number
  | boolean
  | {
      name: string;
      mimeType?: string;
      buffer: Buffer;
    };

export class RestClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string
  ) {}

  getBaseUrl(): string {
    return this.baseUrl;
  }

  protected headers(auth?: Auth): Record<string, string> {
    if (!auth) { return {}; }
    if (auth.type === 'bearer') { return { Authorization: `Bearer ${auth.token}` }; }
    if (auth.type === 'basic') {
      const b64 = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
      return { Authorization: `Basic ${b64}` };
    }
    return { Authorization: `Bearer ${auth.accessToken}` };
  }

  async get(path: string, auth?: Auth): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}${path}`, { headers: this.headers(auth) });
  }

  async head(path: string, auth?: Auth): Promise<APIResponse> {
    return this.request.fetch(`${this.baseUrl}${path}`, { method: 'HEAD', headers: this.headers(auth) });
  }

  async options(path: string, auth?: Auth): Promise<APIResponse> {
    return this.request.fetch(`${this.baseUrl}${path}`, { method: 'OPTIONS', headers: this.headers(auth) });
  }

  async post(path: string, body: unknown, auth?: Auth): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}${path}`, {
      data: body,
      headers: { ...this.headers(auth), 'Content-Type': 'application/json' },
    });
  }

  async put(path: string, body: unknown, auth?: Auth): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}${path}`, {
      data: body,
      headers: { ...this.headers(auth), 'Content-Type': 'application/json' },
    });
  }

  async patch(path: string, body: unknown, auth?: Auth): Promise<APIResponse> {
    return this.request.patch(`${this.baseUrl}${path}`, {
      data: body,
      headers: { ...this.headers(auth), 'Content-Type': 'application/json' },
    });
  }

  async delete(path: string, auth?: Auth): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}${path}`, { headers: this.headers(auth) });
  }

  async deleteWithBody(path: string, body: unknown, auth?: Auth): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}${path}`, {
      data: body,
      headers: { ...this.headers(auth), 'Content-Type': 'application/json' },
    });
  }

  /**
   * multipart/form-data POST. Primitive values become text fields; object shape sends a binary file field.
   */
  async postMultipart(
    path: string,
    fields: Record<string, MultipartField>,
    auth?: Auth
  ): Promise<APIResponse> {
    const multipart: Record<string, string | number | boolean | { name: string; mimeType?: string; buffer: Buffer }> =
      {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== null && typeof val === 'object' && 'buffer' in val && Buffer.isBuffer(val.buffer)) {
        multipart[key] = {
          name: val.name,
          mimeType: val.mimeType ?? 'application/octet-stream',
          buffer: val.buffer,
        };
      } else {
        multipart[key] = val as string | number | boolean;
      }
    }
    return this.request.post(`${this.baseUrl}${path}`, {
      multipart: multipart as never,
      headers: this.headers(auth),
    });
  }

  /** Raw POST with explicit headers (e.g. text/xml). */
  async postRaw(
    path: string,
    body: string | Buffer,
    headers: Record<string, string>,
    auth?: Auth
  ): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}${path}`, {
      data: body,
      headers: { ...this.headers(auth), ...headers },
    });
  }

  /** Full URL (ignores baseUrl). */
  async getAbsolute(url: string, auth?: Auth): Promise<APIResponse> {
    return this.request.get(url, { headers: this.headers(auth) });
  }

  async postAbsolute(url: string, body: unknown, auth?: Auth): Promise<APIResponse> {
    return this.request.post(url, {
      data: body,
      headers: { ...this.headers(auth), 'Content-Type': 'application/json' },
    });
  }
}
