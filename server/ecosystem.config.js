module.exports = {
  apps: [
    {
      name: 'codenotify-server',
      script: './dist/main.js',

      exec_mode: 'cluster',
      instances: '1',

      autorestart: true,
      watch: false,

      max_memory_restart: '1G',

      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },

      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      min_uptime: '10s',
      max_restarts: 10,

      kill_timeout: 10000,
      wait_ready: false,
    },
  ],
};


// pm2 list                    # List all processes
// pm2 logs codenotify-server  # View logs
// pm2 restart codenotify-server  # Restart app
// pm2 stop codenotify-server  # Stop app
// pm2 reload codenotify-server  # Zero-downtime reload
// pm2 delete codenotify-server  # Remove from PM2
// pm2 monit                   # Monitor CPU/Memory


// Start
// pm2 start ecosystem.config.js

// Zero-downtime reload (cluster mode)
// pm2 reload codenotify-server

// After git pull + build
// git pull
// npm run build
// pm2 reload codenotify-server