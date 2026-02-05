export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  tenantId: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends JWTPayload {
  tokenId: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  tenantId: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  tenantId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
