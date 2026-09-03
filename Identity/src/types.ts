export type IdentityProviderType = 'ldap' | 'oidc' | 'entra';

export interface IdentityRoleMapping {
  source: string;
  role: string;
}

export interface IdentityUser {
  id: string;
  username: string;
  displayName?: string;
  roles: string[];
  enabled: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: string;
  externalIdentities: Array<{ providerId: string; subject: string }>;
  version: string;
}

export interface IdentityProvider {
  id: string;
  displayName: string;
  type: IdentityProviderType;
  enabled: boolean;
  autoProvision: boolean;
  defaultRoles: string[];
  roleMappings: IdentityRoleMapping[];
  hasSecret: boolean;
  settings: Record<string, string | number | boolean>;
  version: string;
}

export interface IdentityStatus {
  authenticated: boolean;
  bootstrapRequired: boolean;
  username?: string;
  mustChangePassword?: boolean;
  roles: string[];
  providers: Array<{ id: string; displayName: string; type: IdentityProviderType }>;
  antiforgeryToken: string;
}

export interface IdentityApi {
  status: () => Promise<IdentityStatus>;
  bootstrap: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string, providerId?: string) => Promise<void>;
  startExternalLogin: (providerId: string, returnUrl: string) => Promise<string>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  roles: () => Promise<string[]>;
  users: () => Promise<IdentityUser[]>;
  createUser: (input: { username: string; displayName?: string; roles: string[] }) => Promise<{ temporaryPassword: string }>;
  updateUser: (id: string, input: { displayName?: string; roles: string[]; enabled: boolean; version: string }) => Promise<void>;
  resetPassword: (id: string) => Promise<{ temporaryPassword: string }>;
  deleteUser: (id: string) => Promise<void>;
  providers: () => Promise<IdentityProvider[]>;
  saveProvider: (provider: IdentityProvider, secret?: string) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  testProvider: (provider: IdentityProvider, secret?: string) => Promise<{ succeeded: boolean; message: string }>;
}
