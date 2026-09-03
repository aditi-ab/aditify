import type { IdentityApi, IdentityProvider, IdentityUser } from './types';

type GraphqlExecutor = <T>(document: string, variables?: Record<string, unknown>) => Promise<T>;

export interface GraphqlIdentityCompatibilityOptions {
  graphql: GraphqlExecutor;
  lastLoginField: 'lastLoginAt' | 'lastLoginAtUtc';
  mutationPayloads?: boolean;
  userDisplayName?: boolean;
}

interface LegacyUser { id: string; username: string; displayName?: string; roles: string[]; enabled: boolean; mustChangePassword: boolean; lastLoginAt?: string; version: string }
interface LegacyEntra { enabled: boolean; configured: boolean; authority: string; audience: string; clientId: string; scope: string; version: string }

function unsupported(): never {
  throw new Error('This authentication operation requires the server-session identity endpoints.');
}
function checkErrors(value: { errors?: Array<{ message?: string }> } | undefined) {
  if (value?.errors?.length)
    throw new Error(value.errors.map(error => error.message).filter(Boolean).join(' '));
}

export function createGraphqlIdentityCompatibilityApi(options: GraphqlIdentityCompatibilityOptions): IdentityApi {
  const loginField = options.lastLoginField === 'lastLoginAtUtc' ? 'lastLoginAt:lastLoginAtUtc' : 'lastLoginAt';
  const displayNameField = options.userDisplayName ? ' displayName' : '';
  const load = () => options.graphql<{ localUsers: LegacyUser[]; localRoleCatalog: string[]; entraConnection: LegacyEntra }>(
    `query{localUsers{id username${displayNameField} roles enabled mustChangePassword ${loginField} version} localRoleCatalog entraConnection{enabled configured authority audience clientId scope version}}`,
  );
  const provider = (entra: LegacyEntra): IdentityProvider => ({
    id: 'entra',
    displayName: 'Microsoft Entra ID',
    type: 'entra',
    enabled: entra.enabled,
    autoProvision: false,
    defaultRoles: ['Reader'],
    roleMappings: [],
    hasSecret: false,
    version: entra.version,
    settings: { authority: entra.authority, audience: entra.audience, clientId: entra.clientId, scopes: entra.scope, roleClaim: 'roles', nameClaim: 'name', emailClaim: 'preferred_username', subjectClaim: 'sub', usePkce: true },
  });
  return {
    status: async () => unsupported(),
    bootstrap: async () => unsupported(),
    login: async () => unsupported(),
    startExternalLogin: async () => unsupported(),
    logout: async () => unsupported(),
    changePassword: async () => unsupported(),
    roles: async () => (await load()).localRoleCatalog,
    users: async () => (await load()).localUsers.map((user): IdentityUser => ({ ...user, externalIdentities: [] })),
    async createUser(input) {
      const displayNameArgument = options.userDisplayName ? ',$d:String' : '';
      const displayNameParameter = options.userDisplayName ? ',displayName:$d' : '';
      const data = await options.graphql<{ createLocalUser: { temporaryPassword: string; errors?: Array<{ message?: string }> } }>(
        `mutation($u:String!,$r:[String!]!${displayNameArgument}){createLocalUser(username:$u,roles:$r${displayNameParameter}){temporaryPassword${options.mutationPayloads ? ' errors{message}' : ''}}}`,
        { u: input.username, r: input.roles, ...(options.userDisplayName ? { d: input.displayName } : {}) },
      );
      checkErrors(data.createLocalUser);
      return { temporaryPassword: data.createLocalUser.temporaryPassword };
    },
    async updateUser(id, input) {
      const displayNameArgument = options.userDisplayName ? ',$d:String' : '';
      const displayNameParameter = options.userDisplayName ? ',displayName:$d' : '';
      const data = await options.graphql<{ updateLocalUser?: { errors?: Array<{ message?: string }> } }>(
        `mutation($id:UUID!,$v:UUID!,$r:[String!]!,$e:Boolean!${displayNameArgument}){updateLocalUser(id:$id,expectedVersion:$v,roles:$r,enabled:$e${displayNameParameter}){${options.mutationPayloads ? 'errors{message}' : 'id'}}}`,
        { id, v: input.version, r: input.roles, e: input.enabled, ...(options.userDisplayName ? { d: input.displayName } : {}) },
      );
      checkErrors(data.updateLocalUser);
    },
    async resetPassword(id) {
      const data = await options.graphql<{ resetLocalUserPassword: { temporaryPassword: string } }>(`mutation($id:UUID!){resetLocalUserPassword(id:$id){temporaryPassword}}`, { id });
      return data.resetLocalUserPassword;
    },
    async deleteUser(id) { await options.graphql(`mutation($id:UUID!){deleteLocalUser(id:$id)${options.mutationPayloads ? '{success}' : ''}}`, { id }); },
    providers: async () => [provider((await load()).entraConnection)],
    async saveProvider(value) {
      const variables = { enabled: value.enabled, authority: String(value.settings.authority ?? ''), audience: String(value.settings.audience ?? ''), clientId: String(value.settings.clientId ?? ''), scope: String(value.settings.scopes ?? ''), version: value.version };
      await options.graphql(`mutation($enabled:Boolean!,$authority:String!,$audience:String!,$clientId:String!,$scope:String!,$version:UUID!){updateEntraConnection(enabled:$enabled,authority:$authority,audience:$audience,clientId:$clientId,scope:$scope,expectedVersion:$version){enabled}}`, variables);
    },
    async deleteProvider() { throw new Error('Disable the Microsoft Entra provider instead of deleting the compatibility connection.'); },
    async testProvider() { return { succeeded: true, message: 'The compatibility connection settings are valid for saving.' }; },
  };
}
