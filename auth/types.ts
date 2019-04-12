export interface IRule {
  allow: IAllow;
  route: string;
  methods: string[];
}

export interface IAuthConfig {
  active: boolean;
  allowWhenNoRule: boolean;
}

export interface IUserDetails {
  userId: string;
  userRoles: IRole[];
}

export interface IRequestDetails {
  baseUrl: string;
  path: string;
  method: string;
}

interface IAllow {
  roleLevel?: string;
  roleType?: string;
  roleName?: string;
}

interface IRole {
  roleLevel: string;
  roleName?: string;
  roleType: string;
}