import { describe, expect, it } from 'vitest';
import { createIdentityApi } from './api';
import { identityMessages } from './messages';

describe('identity package', () => {
  it('ships localized management copy', () => {
    expect(identityMessages.en.identity.title).toBeTruthy();
    expect(identityMessages.sv.identity.title).toBeTruthy();
  });

  it('reports non-JSON server responses without exposing a parser error', async () => {
    let requestedUrl = '';
    const api = createIdentityApi({
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response('<!doctype html>', { status: 200, headers: { 'content-type': 'text/html' } });
      },
    });

    await expect(api.users()).rejects.toThrow('The server returned an invalid response.');
    expect(requestedUrl).toBe('/admin/identity/users');
  });
});
