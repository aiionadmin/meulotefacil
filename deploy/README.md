# Deploy — Meu Lote Fácil (VPS)

Produção atual: **https://meulotefacil.com.br** (VPS DigitalOcean).

## Stack na VPS

- Ubuntu 24.04 · Node 22 · nginx · PM2 · swap 2G
- App em `/var/www/meulotefacil`
- Processo: `pm2` app `meulotefacil` → `127.0.0.1:3000`
- TLS: Let's Encrypt (`certbot --nginx`), renovação automática

## Atualizar o código

```bash
cd /var/www/meulotefacil
git fetch origin
git checkout main   # ou a branch de release
git pull
npm ci
NODE_OPTIONS=--max-old-space-size=1536 npm run build
pm2 restart meulotefacil
```

## Variáveis

Copie `.env.example` → `.env.local`. Supabase vazio = modo demo.

## DNS

| Tipo | Nome | Valor |
| --- | --- | --- |
| A | `@` | IP da VPS |
| A | `www` | IP da VPS |
