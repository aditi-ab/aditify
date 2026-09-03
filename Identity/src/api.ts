import type { IdentityApi, IdentityProvider, IdentityStatus, IdentityUser } from './types';

export interface IdentityEndpointPaths {
  status: string;
  bootstrap: string;
  login: string;
  externalStart: (providerId: string) => string;
  logout: string;
  changePassword: string;
  roles: string;
  users: string;
  user: (id: string) => string;
  resetPassword: (id: string) => string;
  providers: string;
  provider: (id: string) => string;
  testProvider: string;
}

export interface IdentityApiOptions {
  baseUrl?: string;
  endpoints?: Partial<IdentityEndpointPaths>;
  fetch?: typeof globalThis.fetch;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
  antiforgeryHeader?: string;
}

export const defaultIdentityEndpoints: IdentityEndpointPaths = {
  status: '/auth/status',
  bootstrap: '/auth/bootstrap',
  login: '/auth/login',
  externalStart: providerId => `/auth/external/${encodeURIComponent(providerId)}/start`,
  logout: '/auth/logout',
  changePassword: '/auth/change-password',
  roles: '/identity/roles',
  users: '/identity/users',
  user: id => `/identity/users/${encodeURIComponent(id)}`,
  resetPassword: id => `/identity/users/${encodeURIComponent(id)}/reset-password`,
  providers: '/identity/providers',
  provider: id => `/identity/providers/${encodeURIComponent(id)}`,
  testProvider: '/identity/providers/test',
};

function combineUrl(baseUrl: string, path: string) {
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(path))
    return path;
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

/** Creates the default REST implementation. Pass an IdentityApi directly to the components for other transports. */
export function createIdentityApi(configuration: string | IdentityApiOptions = {}): IdentityApi {
  const options = typeof configuration === 'string' ? { baseUrl: configuration } : configuration;
  const baseUrl = options.baseUrl ?? '/admin';
  const endpoints: IdentityEndpointPaths = { ...defaultIdentityEndpoints, ...options.endpoints };
  const fetcher = options.fetch ?? globalThis.fetch.bind(globalThis);
  const credentials = options.credentials ?? 'same-origin';
  const antiforgeryHeader = options.antiforgeryHeader ?? 'X-CSRF-TOKEN';
  let antiforgeryToken = '';

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(options.headers);
    new Headers(init?.headers).forEach((value, name) => headers.set(name, value));
    if (!headers.has('content-type'))
      headers.set('content-type', 'application/json');
    if (antiforgeryToken)
      headers.set(antiforgeryHeader, antiforgeryToken);

    const response = await fetcher(combineUrl(baseUrl, path), { ...init, credentials, headers });
    if (response.status === 204)
      return undefined as T;

    const text = await response.text();
    let body: { message?: string; details?: string[] } | T | undefined;

    if (text) {
      try {
        body = JSON.parse(text) as typeof body;
      }
      catch {
        throw new Error(response.ok ? 'The server returned an invalid response.' : `Request failed (${response.status}).`);
      }
    }

    if (!response.ok) {
      const error = body as { message?: string; details?: string[] } | undefined;
      throw new Error(error?.details?.join(' ') || error?.message || `Request failed (${response.status}).`);
    }

    return body as T;
  }

  async function status() {
    const value = await request<IdentityStatus>(endpoints.status);
    antiforgeryToken = value.antiforgeryToken;
    return value;
  }

  async function post<T>(path: string, body?: unknown) {
    if (!antiforgeryToken)
      await status();
    return request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
  }

  return {
    status,
    async bootstrap(username, password) { await post(endpoints.bootstrap, { username, password }); },
    async login(username, password, providerId) { await post(endpoints.login, { username, password, providerId }); },
    async startExternalLogin(providerId, returnUrl) { return (await post<{ url: string }>(endpoints.externalStart(providerId), { returnUrl })).url; },
    async logout() { await post(endpoints.logout); },
    async changePassword(currentPassword, newPassword) { await post(endpoints.changePassword, { currentPassword, newPassword }); },
    roles: () => request<string[]>(endpoints.roles),
    users: () => request<IdentityUser[]>(endpoints.users),
    createUser: input => post(endpoints.users, input),
    async updateUser(id, input) { await request(endpoints.user(id), { method: 'PUT', body: JSON.stringify(input) }); },
    resetPassword: id => post(endpoints.resetPassword(id)),
    async deleteUser(id) { await request(endpoints.user(id), { method: 'DELETE' }); },
    providers: () => request<IdentityProvider[]>(endpoints.providers),
    async saveProvider(provider, secret) { await request(endpoints.provider(provider.id), { method: 'PUT', body: JSON.stringify({ ...provider, secret }) }); },
    async deleteProvider(id) { await request(endpoints.provider(id), { method: 'DELETE' }); },
    testProvider: (provider, secret) => post(endpoints.testProvider, { ...provider, secret }),
  };
}
