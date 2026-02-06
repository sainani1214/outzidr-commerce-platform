import { authService, verifyToken } from '../auth.service';
import { User } from '../../users/user.model';
import { RefreshToken } from '../refreshToken.model';
import { JWTPayload, RefreshTokenPayload } from '../auth.types';

describe('AuthService', () => {
  const tenantId = 'tenant_test';
  const testUser = {
    email: 'test@example.com',
    password: 'Test123!@#',
    name: 'Test User',
    tenantId,
  };

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const user = await authService.register(testUser);

      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
      expect(user.name).toBe(testUser.name);
      expect(user.tenantId).toBe(tenantId);
    });

    it('should hash the password', async () => {
      const user = await authService.register(testUser);
      expect(user.passwordHash).not.toBe(testUser.password);
      expect(user.passwordHash).toMatch(/^\$2[aby]\$/);
    });

    it('should throw error for duplicate email in same tenant', async () => {
      await authService.register(testUser);

      await expect(
        authService.register(testUser)
      ).rejects.toThrow('User with this email already exists');
    });

    it('should allow same email in different tenants', async () => {
      await authService.register({ ...testUser, tenantId: 'tenant_1' });
      await authService.register({ ...testUser, tenantId: 'tenant_2' });

      const count = await User.countDocuments({ email: testUser.email });
      expect(count).toBe(2);
    });

    it('should throw error for invalid email', async () => {
      await expect(
        authService.register({ ...testUser, email: 'invalid-email' })
      ).rejects.toThrow();
    });

    it('should throw error for weak password', async () => {
      await expect(
        authService.register({ ...testUser, password: '123' })
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register(testUser);
    });

    it('should login with correct credentials', async () => {
      const result = await authService.login({
        email: testUser.email,
        password: testUser.password,
        tenantId,
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(testUser.email);
    });

    it('should generate valid JWT tokens', async () => {
      const result = await authService.login({
        email: testUser.email,
        password: testUser.password,
        tenantId,
      });

      const decoded = verifyToken<JWTPayload>(result.tokens.accessToken);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.tenantId).toBe(tenantId);
      expect(decoded).toHaveProperty('userId');
    });

    it('should create refresh token in database', async () => {
      const result = await authService.login({
        email: testUser.email,
        password: testUser.password,
        tenantId,
      });

      const refreshDecoded = verifyToken<RefreshTokenPayload>(result.tokens.refreshToken);
      const stored = await RefreshToken.findOne({ tokenId: refreshDecoded.tokenId });
      
      expect(stored).toBeDefined();
      expect(stored?.revoked).toBe(false);
    });

    it('should throw error for wrong password', async () => {
      await expect(
        authService.login({
          email: testUser.email,
          password: 'wrongpassword',
          tenantId,
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for non-existent email', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: testUser.password,
          tenantId,
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for wrong tenant', async () => {
      await expect(
        authService.login({
          email: testUser.email,
          password: testUser.password,
          tenantId: 'wrong_tenant',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshTokens', () => {
    let refreshToken: string;
    let tokenPayload: RefreshTokenPayload;

    beforeEach(async () => {
      await authService.register(testUser);
      const result = await authService.login({
        email: testUser.email,
        password: testUser.password,
        tenantId,
      });
      refreshToken = result.tokens.refreshToken;
      tokenPayload = verifyToken<RefreshTokenPayload>(refreshToken);
    });

    it('should refresh tokens with valid refresh token', async () => {
      const result = await authService.refreshTokens(tokenPayload);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.refreshToken).not.toBe(refreshToken);
    });

    it('should invalidate old refresh token', async () => {
      await authService.refreshTokens(tokenPayload);

      const oldToken = await RefreshToken.findOne({ tokenId: tokenPayload.tokenId });
      expect(oldToken?.revoked).toBe(true);
    });

    it('should create new refresh token in database', async () => {
      const result = await authService.refreshTokens(tokenPayload);
      
      const newDecoded = verifyToken<RefreshTokenPayload>(result.refreshToken);
      const stored = await RefreshToken.findOne({ tokenId: newDecoded.tokenId });
      
      expect(stored).toBeDefined();
      expect(stored?.revoked).toBe(false);
    });

    it('should throw error for invalid token ID', async () => {
      await expect(
        authService.refreshTokens({ ...tokenPayload, tokenId: 'invalid-id' })
      ).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw error for already revoked token', async () => {
      await authService.refreshTokens(tokenPayload);
      
      await expect(
        authService.refreshTokens(tokenPayload)
      ).rejects.toThrow('Invalid or expired refresh token');
    });
  });

  describe('revokeRefreshToken', () => {
    let tokenPayload: RefreshTokenPayload;

    beforeEach(async () => {
      await authService.register(testUser);
      const result = await authService.login({
        email: testUser.email,
        password: testUser.password,
        tenantId,
      });
      tokenPayload = verifyToken<RefreshTokenPayload>(result.tokens.refreshToken);
    });

    it('should revoke refresh token', async () => {
      await authService.revokeRefreshToken(tokenPayload.tokenId);

      const token = await RefreshToken.findOne({ tokenId: tokenPayload.tokenId });
      expect(token?.revoked).toBe(true);
    });

    it('should not throw error for non-existent token', async () => {
      await expect(
        authService.revokeRefreshToken('nonexistent-id')
      ).resolves.not.toThrow();
    });

    it('should not revoke already revoked token twice', async () => {
      await authService.revokeRefreshToken(tokenPayload.tokenId);
      await authService.revokeRefreshToken(tokenPayload.tokenId);

      const tokens = await RefreshToken.find({ tokenId: tokenPayload.tokenId, revoked: true });
      expect(tokens).toHaveLength(1);
    });
  });
});
