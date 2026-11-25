/** PM2 — produção (VPS). Uso: `pm2 start ecosystem.config.cjs` */
module.exports = {
  apps: [
    {
      name: "meulotefacil",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 127.0.0.1",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
