import { FastifyInstance } from 'fastify';
import { buildApp } from '../../app';

export async function createTestApp(): Promise<FastifyInstance> {
  // Override MONGODB_URI to use the already-connected test database
  const originalUri = process.env.MONGODB_URI;
  process.env.MONGODB_URI = 'mongodb://localhost/test'; 
  
  const testApp = await buildApp();
  
  // Restore original URI
  process.env.MONGODB_URI = originalUri;
  
  // Override logger for tests
  testApp.log.level = 'silent';

  // Skip actual MongoDB connection since it's already connected in setup.ts
  // The app will use the existing mongoose connection
  
  return testApp;
}

export interface TestUser {
  email: string;
  password: string;
  name: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface TestContext {
  app: FastifyInstance;
  tenantId: string;
  user?: TestUser;
}

export async function setupTestContext(): Promise<TestContext> {
  const testApp = await createTestApp();
  await testApp.ready();

  return {
    app: testApp,
    tenantId: 'test_tenant_' + Date.now(),
  };
}

export async function teardownTestContext(context: TestContext): Promise<void> {
  await context.app.close();
}
