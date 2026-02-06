import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User, IUserDocument } from '../users/user.model';
import { RefreshToken } from './refreshToken.model';
import { JWTPayload, RefreshTokenPayload, CreateUserDTO, LoginDTO, AuthTokens } from './auth.types';
import { Validators } from '../../utils/validators';
import { ConflictError, UnauthorizedError } from '../../utils/errors';

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";
const SALT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, process.env.JWT_PRIVATE_KEY!, {
    algorithm: "RS256",
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

function signRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, tokenId: string): string {
  return jwt.sign(
    { ...payload, tokenId },
    process.env.JWT_PRIVATE_KEY!,
    {
      algorithm: "RS256",
      expiresIn: REFRESH_TOKEN_TTL,
    }
  );
}

export function verifyToken<T = JWTPayload | RefreshTokenPayload>(token: string): T {
  return jwt.verify(token, process.env.JWT_PUBLIC_KEY!, { algorithms: ['RS256'] }) as T;
}

class AuthService {
  async register(dto: CreateUserDTO): Promise<IUserDocument> {
    Validators.email(dto.email);
    Validators.password(dto.password);

    const existingUser = await User.findOne({
      email: dto.email,
      tenantId: dto.tenantId,
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return await User.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      tenantId: dto.tenantId,
    });
  }

  async login(dto: LoginDTO): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
    const user = await User.findOne({
      email: dto.email,
      tenantId: dto.tenantId,
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    return { user, tokens };
  }

  async refreshTokens(payload: RefreshTokenPayload): Promise<AuthTokens> {
    const stored = await RefreshToken.findOne({
      tokenId: payload.tokenId,
      revoked: false,
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    stored.revoked = true;
    await stored.save();

    const tokenId = randomUUID();

    const accessToken = signAccessToken({
      userId: payload.userId,
      tenantId: payload.tenantId,
      email: payload.email,
    });

    const refreshToken = signRefreshToken(
      {
        userId: payload.userId,
        tenantId: payload.tenantId,
        email: payload.email,
      },
      tokenId
    );

    await RefreshToken.create({
      userId: payload.userId,
      tenantId: payload.tenantId,
      tokenId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    const token = await RefreshToken.findOne({ tokenId, revoked: false });
    if (token) {
      token.revoked = true;
      await token.save();
    }
  }

  private async generateTokens(user: IUserDocument): Promise<AuthTokens> {
    const tokenId = randomUUID();
    const userData = user.toUserObject();

    const accessToken = signAccessToken({
      userId: userData.id,
      tenantId: userData.tenantId,
      email: userData.email,
    });

    const refreshToken = signRefreshToken(
      {
        userId: userData.id,
        tenantId: userData.tenantId,
        email: userData.email,
      },
      tokenId
    );

    await RefreshToken.create({
      userId: userData.id,
      tenantId: userData.tenantId,
      tokenId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
