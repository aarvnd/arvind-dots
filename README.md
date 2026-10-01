# Arvind Dots

A self-hosted personal AI agent workspace. Chat with assistants, connect apps, run computer tasks, and approve every risky action before it happens. Built and run by [Arvind Kumar](https://arvind.codes) at [dots.arvind.codes](https://dots.arvind.codes).

> **Status:** personal project, single owner, actively maintained. It is meant for one person's own machine or VPS.

## What it does

- Assistants with their own instructions, model and identity.
- Streaming chat with Markdown, image attachments and browser dictation.
- Any Responses-compatible model endpoint; model IDs are configured in Settings.
- A deny-by-default action gateway. Workspace and computer actions pause for approval and are written to an audit log.
- App connectors through Composio with explicit OAuth.
- `/search <query>` for web lookups through You.com.
- Optional Docker/Playwright computer runtime per assistant.
- SQLite state and encrypted provider credentials under one data directory.

## Run it locally

Requirements: Node.js 20+, Python 3.10+.

```bash
git clone https://github.com/aarvnd/arvind-dots.git
cd arvind-dots/server
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python run.py            # API on http://127.0.0.1:8000
```

In a second terminal:

```bash
cd arvind-dots/client
npm install
npm run dev              # UI on http://127.0.0.1:3000
```

Open `http://127.0.0.1:3000/app`. On first start the server writes an owner token to `~/.arvind-dots/.auth-token`; paste it into the sign-in form. Then open Settings, add your model API base URL and key, and save the model IDs you want to use.

## Configuration

All settings are environment variables. The server also reads `server/.env` if it exists.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATA_DIR` | `~/.arvind-dots` | SQLite database, owner token, encryption key |
| `APP_AUTH_TOKEN` | generated | Owner credential for sign-in |
| `APP_ENCRYPTION_KEY` | generated | Fernet key for stored credentials |
| `MODEL_API_BASE_URL` / `MODEL_API_KEY` | empty | Fallback provider settings (the UI settings win) |
| `DEFAULT_MODEL` | `gpt-5-mini` | Model for new assistants |
| `COMPOSIO_API_KEY` | empty | Connector credential |
| `YDC_API_KEY` | empty | You.com key for `/search` |
| `WORKSPACE_ROOT` | project root | Boundary for workspace actions |
| `COMPUTER_PROVIDER` | `fake` | `fake`, `docker` or `remote` |
| `COMPUTER_DOCKER_IMAGE` | `arvind-dots-computer:1.62.1` | Image for the Docker provider |
| `CORS_ORIGINS` | localhost:3000 | Allowed browser origins |
| `AUTH_COOKIE_SECURE` | `0` | Set `1` behind HTTPS |
| `HOST` / `PORT` | `127.0.0.1` / `8000` | API bind address |

## Deploying

The production setup (nginx, PM2, certbot) is documented in [`deploy/README.md`](deploy/README.md). Keep the UI and API on one origin so the session cookie is sent, set `AUTH_COOKIE_SECURE=1`, and never put credentials in `NEXT_PUBLIC_*` variables.

## Computer runtime

```bash
docker build -t arvind-dots-computer:1.62.1 ./runtime
export COMPUTER_PROVIDER=docker
```

Containers get a per-assistant workspace, a read-only root filesystem, dropped capabilities and resource limits. This is not a hardened sandbox for hostile websites.

## Development

```bash
cd server && .venv/bin/python -m pytest      # API tests
cd client && npm run lint && npm run build    # UI checks
```

## License

MIT. See [LICENSE](LICENSE).
