export enum Roles {
  admin = 1,
  superAdmin = 999,
}

export interface UserLoginReuestInterface {
  emailOrUserName: string;
  password: string;
}

export interface ChangePasswordRequestInterface {
  confirmPassword: string;
  currentPassword: string;
  password: string;
}

export interface UserInterface {
  id?: any;
  name?: string;
  userName?: string;
  userRoleId?: any;
  email?: string;
  permission?: string;
  actionPermission?: string;
  status?: any;
  rememberToken?: string;
  image?: string;
}

export interface LoginResponseInterface {
  token?: string;
  user?: UserInterface;
  error?: string;
  message?: string;
}

export interface AuthenticationInterface {
  isAuthentic?: boolean;
  message?: string;
}
