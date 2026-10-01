# Deploying Arvind Dots

Target: `https://dots.arvind.codes`, path `/root/arvind-dots` on the server.

## One-time setup

1. DNS: add `A dots → <server ip>` with any CDN/proxy **off** (a CDN buffers the chat stream).
2. Clone and build:
   ```bash
   cd /root && git clone https://github.com/aarvnd/arvind-dots.git && cd arvind-dots
   cd server && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && cd ..
   mkdir -p data/workspace
   ```
3. Create `server/.env` (never committed):
   ```
   HOST=127.0.0.1
   PORT=4201
   DATA_DIR=/root/arvind-dots/data
   WORKSPACE_ROOT=/root/arvind-dots/data/workspace
   APP_AUTH_TOKEN=<openssl rand -hex 32>
   AUTH_COOKIE_SECURE=1
   CORS_ORIGINS=https://dots.arvind.codes
   COMPUTER_PROVIDER=fake
   ```
4. Build the client against the public API URL:
   ```bash
   cd client && npm ci && NEXT_PUBLIC_API_URL=https://dots.arvind.codes/api/v1 npm run build && cd ..
   ```
5. nginx:
   ```bash
   cp deploy/nginx.dots.arvind.codes.conf /etc/nginx/sites-available/dots.arvind.codes
   ln -s /etc/nginx/sites-available/dots.arvind.codes /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx
   certbot --nginx -d dots.arvind.codes --redirect
   ```
6. PM2:
   ```bash
   pm2 start ecosystem.config.cjs && pm2 save
   ```
7. Optional computer runtime:
   ```bash
   docker build -t arvind-dots-computer:1.62.1 ./runtime
   # then set COMPUTER_PROVIDER=docker in server/.env
   pm2 restart dots-api
   ```

## Each later deploy

```bash
cd /root/arvind-dots && git pull
cd server && .venv/bin/pip install -q -r requirements.txt && cd ..
cd client && npm ci && NEXT_PUBLIC_API_URL=https://dots.arvind.codes/api/v1 npm run build && cd ..
pm2 restart dots-api dots-web
curl -s https://dots.arvind.codes/api/v1/health
```

## Rollback

`git log` on the server, `git checkout <previous sha>`, rebuild the client, `pm2 restart dots-api dots-web`. `data/` is untouched by deploys.
