module.exports = {
  apps: [
    {
      name: 'api',
      script: './apps/api/src/server.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
    },
    {
      name: 'web',
      script: 'npm',
      args: 'run dev',
      cwd: './apps/web',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
    },
    {
      name: 'admin',
      script: 'npm',
      args: 'run dev',
      cwd: './apps/admin',
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
      },
    },
  ],
};
