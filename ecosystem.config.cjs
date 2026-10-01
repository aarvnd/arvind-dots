module.exports = {
  apps: [
    {
      name: 'dots-api',
      cwd: __dirname + '/server',
      script: '.venv/bin/uvicorn',
      args: 'app.main:app --host 127.0.0.1 --port 4201',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '600M',
    },
    {
      name: 'dots-web',
      cwd: __dirname + '/client',
      script: 'node_modules/.bin/next',
      args: 'start -p 4200',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      env: { NODE_ENV: 'production' },
    },
  ],
};
