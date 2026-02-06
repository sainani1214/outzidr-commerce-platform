import { buildApp } from './app';

const start = async () => {
  const app = await buildApp();

  // Graceful shutdown handler
  const closeApp = async (signal: string) => {
    app.log.info({ signal }, 'Shutting down server gracefully');
    await app.close();
    process.exit(0);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => closeApp('SIGTERM'));
  process.on('SIGINT', () => closeApp('SIGINT'));

  try {
    const PORT = parseInt(process.env.PORT || '3001', 10);
    const HOST = process.env.HOST || '0.0.0.0';

    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening on http://${HOST}:${PORT}`);
    app.log.info(`API Documentation available at http://localhost:${PORT}/documentation`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
