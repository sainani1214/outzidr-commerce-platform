import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestContext, teardownTestContext, TestContext } from '../helpers/testApp';

describe('Auth Integration Tests', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await setupTestContext();
  });

  afterAll(async () => {
    await teardownTestContext(context);
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'test@example.com',
          password: 'Test@12345',
          confirmPassword: 'Test@12345',
          name: 'Test User',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe('test@example.com');
      expect(body.user.name).toBe('Test User');
      expect(body.user.password).toBeUndefined();
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();

      // Verify cookies are set
      const cookies = response.cookies;
      expect(cookies).toBeDefined();
      const accessTokenCookie = cookies.find((c) => c.name === 'accessToken');
      const refreshTokenCookie = cookies.find((c) => c.name === 'refreshToken');
      expect(accessTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toBeDefined();
      expect(accessTokenCookie?.httpOnly).toBe(true);
      expect(refreshTokenCookie?.httpOnly).toBe(true);
    });

    it('should fail with missing tenant header', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test2@example.com',
          password: 'Test@12345',
          confirmPassword: 'Test@12345',
          name: 'Test User 2',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });

    it('should fail with password mismatch', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'test3@example.com',
          password: 'Test@12345',
          confirmPassword: 'WrongPassword',
          name: 'Test User 3',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      // Register first user
      await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'duplicate@example.com',
          password: 'Test@12345',
          confirmPassword: 'Test@12345',
          name: 'Duplicate User',
        },
      });

      // Try to register again
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'duplicate@example.com',
          password: 'Test@12345',
          confirmPassword: 'Test@12345',
          name: 'Duplicate User 2',
        },
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('exists');
    });

    it('should fail with invalid email format', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'invalid-email',
          password: 'Test@12345',
          confirmPassword: 'Test@12345',
          name: 'Test User',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should fail with weak password', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'weak@example.com',
          password: '12345',
          confirmPassword: '12345',
          name: 'Test User',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeAll(async () => {
      // Create a user for login tests
      await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'login@example.com',
          password: 'Test@12345',
          confirmPassword: 'Test@12345',
          name: 'Login User',
        },
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'login@example.com',
          password: 'Test@12345',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe('login@example.com');
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();

      // Store for later tests
      context.user = {
        email: 'login@example.com',
        password: 'Test@12345',
        name: 'Login User',
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
      };
    });

    it('should fail with wrong password', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'login@example.com',
          password: 'WrongPassword',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });

    it('should fail with non-existent email', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'nonexistent@example.com',
          password: 'Test@12345',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Register and login to get fresh tokens
      await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'refresh-test@example.com',
          password: 'Test@12345',
          confirmPassword: 'Test@12345',
          name: 'Refresh Test User',
        },
      });

      const loginResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'refresh-test@example.com',
          password: 'Test@12345',
        },
      });

      const loginBody = JSON.parse(loginResponse.body);
      const freshRefreshToken = loginBody.refreshToken;
      expect(freshRefreshToken).toBeDefined();

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          refreshToken: freshRefreshToken,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
    });

    it('should fail with invalid refresh token', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          refreshToken: 'invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should fail with missing refresh token', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {},
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully with valid refresh token', async () => {
      expect(context.user?.refreshToken).toBeDefined();

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          refreshToken: context.user!.refreshToken,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('success');
    });

    it('should fail to use refresh token after logout', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          refreshToken: context.user!.refreshToken,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should get current user with valid access token', async () => {
      // Register and login to get fresh token
      await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'me-test@example.com',
          password: 'Test@12345',
          confirmPassword: 'Test@12345',
          name: 'Me Test User',
        },
      });

      const loginResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          email: 'me-test@example.com',
          password: 'Test@12345',
        },
      });

      const loginBody = JSON.parse(loginResponse.body);
      const newAccessToken = loginBody.accessToken;

      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/users/me',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${newAccessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.email).toBe('me-test@example.com');
      expect(body.name).toBe('Me Test User');
      expect(body.password).toBeUndefined();
    });

    it('should fail without access token', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/users/me',
        headers: {
          'x-tenant-id': context.tenantId,
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should fail with invalid access token', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/users/me',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
