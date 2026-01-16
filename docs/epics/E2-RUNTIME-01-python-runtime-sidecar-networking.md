# Epic: Python Runtime Sidecar & Networking

**Epic ID:** E2-RUNTIME-01

**Phase:** 2 — Backend Infrastructure

**Status:** Ready for Implementation

**Last Updated:** 2026-01-16

---

## Epic Description

This epic establishes the FastAPI-based orchestration layer on the production VPS (`157.180.94.145`) that runs concurrently with the existing Python runner logic. It implements a non-blocking `uvicorn` server execution strategy to serve as the system's real-time gateway, enabling the Vercel-hosted Next.js frontend to communicate securely over HTTPS. The work includes defining a robust lifecycle manager for graceful startup/shutdown, configuring Caddy as a reverse proxy for automatic TLS, and implementing comprehensive liveness/readiness probes to guarantee zero-zombie process management during service restarts.

**Problem Statement:** The current architecture lacks a runtime API layer. The VPS has a working runner (`/claude-home/runner/`) but no HTTP interface. The Vercel-hosted frontend needs a way to:

1. Trigger Claude sessions programmatically (visit/custom modes)
2. Query session history from `sessions.db`
3. Receive real-time status updates during agent execution
4. Read thoughts/dreams content via API (Vercel cannot mount VPS filesystem)

**Solution:** Extend the existing VPS runner with a FastAPI HTTP interface, exposed via Caddy reverse proxy with automatic HTTPS on a subdomain (e.g., `api.claudehome.dineshd.dev`).

**Deployment Topology:**

```
┌─────────────────────┐         HTTPS          ┌─────────────────────────────┐
│  Vercel (Frontend)  │ ──────────────────────▶│  VPS 157.180.94.145         │
│  claudehome.dineshd.dev    │                        │  ┌─────────────────────────┐│
└─────────────────────┘                        │  │ Caddy (reverse proxy)   ││
                                               │  │ :443 → localhost:8000   ││
                                               │  └───────────┬─────────────┘│
                                               │              │              │
                                               │  ┌───────────▼─────────────┐│
                                               │  │ FastAPI + uvicorn       ││
                                               │  │ localhost:8000          ││
                                               │  │ /claude-home/runner/    ││
                                               │  └─────────────────────────┘│
                                               └─────────────────────────────┘
```

**Exit Criteria:** The VPS serves a FastAPI application at `https://api.claudehome.dineshd.dev` (or configured domain) with health probes, CORS allowing the Vercel frontend, and graceful shutdown handling via systemd.

---

## Prerequisites

Before starting this epic:

1. **VPS Access** — SSH access to `root@157.180.94.145` via `claudehome` alias
2. **Existing Runner** — `/claude-home/runner/` with working `runner.py`, `sessions.py`
3. **Domain DNS** — `api.claudehome.dineshd.dev` (or subdomain) pointed to VPS IP
4. **Python 3.11+** — Already installed on VPS (verify with `python3 --version`)
5. **uv installed** — Package manager on VPS (install if missing)

---

## Governance

### Reference Document

This epic is governed by `CLAUDE.md` at the local repository root. All implementation must comply with:

- **Section 1 (Protocol Zero):** No-AI Attribution Policy
- **Section 5.1 (Python / Runner):** 100% type coverage, Pydantic v2 models, Google-style docstrings
- **Section 5.2 (Containerization & Parity):** Absolute paths (`/claude-home/*`)

### No-AI Attribution Policy

**Enforcement:** Manual review of all code pushed to VPS.

**Policy:** All code must stand on its own merit with no AI attribution markers.

---

## Current State Analysis

### What Exists on VPS (`/claude-home/`)

| Component         | Location                             | Status         |
| ----------------- | ------------------------------------ | -------------- |
| Runner directory  | `/claude-home/runner/`               | ✅ Exists      |
| Main runner logic | `/claude-home/runner/runner.py`      | ✅ Working     |
| Session viewer    | `/claude-home/runner/sessions.py`    | ✅ Working     |
| Session database  | `/claude-home/sessions.db`           | ✅ Working     |
| Python venv       | `/claude-home/runner/.venv/`         | ✅ Python 3.11 |
| Dependencies      | `anthropic`, `python-dotenv`         | ✅ Installed   |
| Cron jobs         | Morning (8am) + Night (9pm) sessions | ✅ Running     |

### What Exists on VPS (System)

| Component      | Status                  |
| -------------- | ----------------------- |
| Ubuntu 22.04   | ✅                      |
| SSH access     | ✅                      |
| Firewall (ufw) | ❓ Check status         |
| Caddy / Nginx  | ❌ Not installed        |
| systemd        | ✅ Available            |
| Certbot / ACME | ❌ (Caddy handles this) |

### What Must Be Built

| Component                          | Story        | Location                                     |
| ---------------------------------- | ------------ | -------------------------------------------- |
| FastAPI application                | S-RUNTIME-01 | `/claude-home/runner/api/`                   |
| Lifespan manager                   | S-RUNTIME-01 | `/claude-home/runner/api/main.py`            |
| CORS middleware (Vercel whitelist) | S-RUNTIME-01 | `/claude-home/runner/api/middleware/`        |
| Structured logging                 | S-RUNTIME-01 | `/claude-home/runner/api/logging.py`         |
| Non-blocking uvicorn integration   | S-RUNTIME-02 | `/claude-home/runner/api/__main__.py`        |
| Caddy reverse proxy                | S-RUNTIME-03 | `/etc/caddy/Caddyfile`                       |
| systemd service unit               | S-RUNTIME-03 | `/etc/systemd/system/claudehome-api.service` |
| Health probes                      | S-RUNTIME-04 | `/claude-home/runner/api/routes/health.py`   |
| Signal handlers                    | S-RUNTIME-05 | `/claude-home/runner/api/lifecycle.py`       |

---

## Dependencies to Add

Add to existing `/claude-home/runner/` project:

### Python Dependencies

| Package             | Version    | Purpose                         |
| ------------------- | ---------- | ------------------------------- |
| `fastapi`           | `^0.115.0` | ASGI web framework              |
| `uvicorn[standard]` | `^0.34.0`  | ASGI server with uvloop         |
| `pydantic-settings` | `^2.7.0`   | Environment-based configuration |
| `structlog`         | `^25.1.0`  | Structured JSON logging         |

### Installation Commands (on VPS)

```bash
cd /claude-home/runner
source .venv/bin/activate
pip install fastapi "uvicorn[standard]" pydantic-settings structlog

# Or if using uv:
uv add fastapi "uvicorn[standard]" pydantic-settings structlog
```

### System Packages (on VPS)

```bash
# Install Caddy (Debian/Ubuntu)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

---

## File Structure

All API code lives within the existing `/claude-home/runner/` directory:

```
/claude-home/runner/
├── pyproject.toml           # Updated with new dependencies
├── uv.lock                   # Updated lockfile
├── .env                      # Add API configuration
├── runner.py                 # Existing (unchanged for now)
├── sessions.py               # Existing (unchanged)
├── main.py                   # Existing stub
└── api/                      # NEW: FastAPI application
    ├── __init__.py
    ├── __main__.py           # Entry point: python -m api
    ├── app.py                # FastAPI app factory + lifespan
    ├── config.py             # Pydantic Settings
    ├── logging.py            # structlog configuration
    ├── lifecycle.py          # Graceful shutdown coordinator
    ├── middleware/
    │   ├── __init__.py
    │   ├── cors.py           # CORS middleware factory
    │   └── logging.py        # Request logging middleware
    └── routes/
        ├── __init__.py
        └── health.py         # Health probe endpoints
```

---

## Configuration Schema

### Environment Variables (`/claude-home/runner/.env`)

Add to existing `.env`:

```bash
# === API Server Configuration ===
API_HOST=127.0.0.1
API_PORT=8000
API_DEBUG=false

# CORS: Vercel frontend URL(s)
API_CORS_ORIGINS=https://claudehome.dineshd.dev,https://www.claudehome.dineshd.dev,http://localhost:3000

# === Existing variables ===
ANTHROPIC_API_KEY=sk-ant-...
```

### Pydantic Settings Model

```python
# /claude-home/runner/api/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """API configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_prefix="API_",
        env_file="/claude-home/runner/.env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    host: str = "127.0.0.1"
    port: int = 8000
    debug: bool = False
    cors_origins: list[str] = ["https://claudehome.dineshd.dev"]
```

---

## Stories

### S-RUNTIME-01: FastAPI Application Skeleton & Lifespan Manager

**Story Points:** 2

**Description:**
Initialize the FastAPI application instance with strictly typed configuration. Implement a custom `Lifespan` context manager to handle startup/shutdown hooks explicitly. Configure strict CORS policies whitelisting only the Vercel frontend domain(s) and localhost for development.

**Acceptance Criteria:**

| #   | Criterion                                                       | Verification Method                                                             |
| --- | --------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | FastAPI app initializes without errors                          | `python -c "from api.app import create_app; create_app()"` exits 0              |
| 2   | `lifespan` handler logs startup/shutdown events                 | Log inspection                                                                  |
| 3   | CORS rejects requests from non-whitelisted origins              | `curl -H "Origin: http://evil.com" -I http://localhost:8000/api/v1/health/live` |
| 4   | CORS allows requests from Vercel domain                         | `curl -H "Origin: https://claudehome.dineshd.dev" -I ...` returns CORS headers  |
| 5   | CORS allows `http://localhost:3000` for local dev               | curl test                                                                       |
| 6   | Structured JSON logging captures method, path, status, duration | Log inspection                                                                  |
| 7   | `/api/v1` prefix established as router base                     | `GET /api/v1/health/live` returns 200                                           |
| 8   | All functions have Google-style docstrings                      | Code review                                                                     |
| 9   | 100% type hints (no `Any`)                                      | `mypy --strict`                                                                 |

**Implementation Reference:**

```python
# /claude-home/runner/api/app.py
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI

from api.config import Settings
from api.middleware.cors import configure_cors
from api.middleware.logging import RequestLoggingMiddleware
from api.routes import health

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application lifecycle."""
    settings: Settings = app.state.settings
    logger.info("api_startup", host=settings.host, port=settings.port)
    yield
    logger.info("api_shutdown")


def create_app(settings: Settings | None = None) -> FastAPI:
    """Factory function to create configured FastAPI application."""
    if settings is None:
        settings = Settings()

    app = FastAPI(
        title="Claude's Home API",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/api/v1/docs" if settings.debug else None,
        redoc_url=None,
    )
    app.state.settings = settings

    # Middleware
    app.add_middleware(RequestLoggingMiddleware)
    configure_cors(app, settings.cors_origins)

    # Routes
    app.include_router(health.router, prefix="/api/v1")

    return app
```

---

### S-RUNTIME-02: Non-Blocking ASGI Server Integration

**Story Points:** 5

**Dependencies:** S-RUNTIME-01

**Description:**
Create an entry point that launches uvicorn as a non-blocking asyncio server. The server must coexist with potential future agent tasks (long-running Claude sessions) without blocking. Bind to `127.0.0.1` only — Caddy handles public exposure.

**Acceptance Criteria:**

| #   | Criterion                                           | Verification Method                             |
| --- | --------------------------------------------------- | ----------------------------------------------- |
| 1   | `python -m api` starts the FastAPI server           | Process runs                                    |
| 2   | Server listens on `127.0.0.1:8000`                  | `curl http://127.0.0.1:8000/api/v1/health/live` |
| 3   | Server does NOT listen on public interface directly | `curl http://157.180.94.145:8000` fails         |
| 4   | `Ctrl+C` triggers graceful shutdown                 | Log shows shutdown sequence                     |
| 5   | Exit code 0 on clean shutdown                       | `echo $?` returns 0                             |
| 6   | Placeholder agent loop runs concurrently            | Log shows both server and agent loop messages   |

**Implementation Reference:**

```python
# /claude-home/runner/api/__main__.py
import asyncio
import signal

import structlog
import uvicorn

from api.app import create_app
from api.config import Settings
from api.lifecycle import GracefulShutdown
from api.logging import configure_logging

logger = structlog.get_logger()


async def agent_loop(shutdown: GracefulShutdown) -> None:
    """Placeholder for future agent task execution."""
    logger.info("agent_loop_started")
    while not shutdown.is_triggered:
        await asyncio.sleep(5.0)
    logger.info("agent_loop_stopped")


async def serve(settings: Settings) -> None:
    """Run uvicorn with graceful shutdown support."""
    app = create_app(settings)
    shutdown = GracefulShutdown()

    config = uvicorn.Config(
        app,
        host=settings.host,
        port=settings.port,
        log_level="warning",
        access_log=False,
    )
    server = uvicorn.Server(config)

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, shutdown.trigger)

    async def shutdown_server() -> None:
        await shutdown.wait()
        server.should_exit = True

    await asyncio.gather(
        server.serve(),
        agent_loop(shutdown),
        shutdown_server(),
        return_exceptions=True,
    )


def main() -> None:
    """Entry point."""
    configure_logging()
    settings = Settings()
    try:
        asyncio.run(serve(settings))
    except KeyboardInterrupt:
        pass
    raise SystemExit(0)


if __name__ == "__main__":
    main()
```

---

### S-RUNTIME-03: Caddy Reverse Proxy & systemd Service

**Story Points:** 3

**Dependencies:** S-RUNTIME-02

**Description:**
Configure Caddy as a reverse proxy with automatic HTTPS via Let's Encrypt. Create a systemd service unit for the FastAPI application with proper restart policies. Configure firewall to allow HTTPS traffic.

**Acceptance Criteria:**

| #   | Criterion                                                     | Verification Method                                           |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | Caddyfile exists at `/etc/caddy/Caddyfile`                    | File exists                                                   |
| 2   | Caddy proxies `api.claudehome.dineshd.dev` → `localhost:8000` | Config review                                                 |
| 3   | HTTPS certificate auto-provisioned                            | `curl -I https://api.claudehome.dineshd.dev` shows valid cert |
| 4   | systemd unit at `/etc/systemd/system/claudehome-api.service`  | File exists                                                   |
| 5   | `systemctl start claudehome-api` starts the service           | Service runs                                                  |
| 6   | `systemctl enable claudehome-api` enables on boot             | Enabled                                                       |
| 7   | Service restarts automatically on failure                     | `Restart=on-failure` in unit                                  |
| 8   | Firewall allows ports 80, 443                                 | `ufw status` shows allowed                                    |
| 9   | Port 8000 NOT exposed to public                               | `ufw status` does not show 8000                               |

**Caddyfile:**

```caddyfile
# /etc/caddy/Caddyfile
api.claudehome.dineshd.dev {
    reverse_proxy localhost:8000

    header {
        # Security headers
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
    }

    log {
        output file /var/log/caddy/api-access.log
        format json
    }
}
```

**systemd Unit:**

```ini
# /etc/systemd/system/claudehome-api.service
[Unit]
Description=Claude's Home API
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/claude-home/runner
Environment="PATH=/claude-home/runner/.venv/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/claude-home/runner/.venv/bin/python -m api
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Firewall Setup:**

```bash
# Enable firewall if not already
sudo ufw enable

# Allow SSH (important!)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS for Caddy
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verify 8000 is NOT exposed
sudo ufw status
```

---

### S-RUNTIME-04: Health Check & Observability Probes

**Story Points:** 2

**Dependencies:** S-RUNTIME-01

**Description:**
Implement `/health/live` and `/health/ready` endpoints. Liveness returns immediately. Readiness validates filesystem access to `/claude-home/thoughts`, `/claude-home/dreams`, and database connectivity.

**Acceptance Criteria:**

| #   | Criterion                                               | Verification Method      |
| --- | ------------------------------------------------------- | ------------------------ |
| 1   | `GET /api/v1/health/live` returns `{"status": "alive"}` | curl                     |
| 2   | Liveness responds in <10ms                              | Response time            |
| 3   | `GET /api/v1/health/ready` returns status + checks      | curl                     |
| 4   | Readiness validates `/claude-home/thoughts` access      | Test with valid mount    |
| 5   | Readiness validates `/claude-home/sessions.db` access   | Test with valid DB       |
| 6   | Readiness returns 503 when dependencies fail            | Remove permissions, test |
| 7   | Health endpoints excluded from request logging          | Log inspection           |

**Implementation Reference:**

```python
# /claude-home/runner/api/routes/health.py
import sqlite3
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter(prefix="/health", tags=["health"])


class LivenessResponse(BaseModel):
    status: Literal["alive"]


class ReadinessCheck(BaseModel):
    name: str
    status: Literal["ok", "failed"]
    message: str | None = None


class ReadinessResponse(BaseModel):
    status: Literal["ready", "not_ready"]
    checks: list[ReadinessCheck]


def check_directory(path: str) -> ReadinessCheck:
    """Verify directory is accessible."""
    try:
        p = Path(path)
        if p.exists() and p.is_dir():
            list(p.iterdir())
            return ReadinessCheck(name=f"dir:{path}", status="ok")
        return ReadinessCheck(name=f"dir:{path}", status="failed", message="Not found")
    except Exception as e:
        return ReadinessCheck(name=f"dir:{path}", status="failed", message=str(e))


def check_database(path: str) -> ReadinessCheck:
    """Verify SQLite database is accessible."""
    try:
        conn = sqlite3.connect(path, timeout=1.0)
        conn.execute("SELECT 1")
        conn.close()
        return ReadinessCheck(name=f"db:{path}", status="ok")
    except Exception as e:
        return ReadinessCheck(name=f"db:{path}", status="failed", message=str(e))


@router.get("/live", response_model=LivenessResponse)
async def liveness() -> LivenessResponse:
    """Liveness probe - immediate response if process running."""
    return LivenessResponse(status="alive")


@router.get("/ready", response_model=ReadinessResponse)
async def readiness() -> JSONResponse:
    """Readiness probe - validates dependencies."""
    checks = [
        check_directory("/claude-home/thoughts"),
        check_directory("/claude-home/dreams"),
        check_database("/claude-home/sessions.db"),
    ]
    all_ok = all(c.status == "ok" for c in checks)
    response = ReadinessResponse(
        status="ready" if all_ok else "not_ready",
        checks=checks,
    )
    code = status.HTTP_200_OK if all_ok else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(content=response.model_dump(), status_code=code)
```

---

### S-RUNTIME-05: Graceful Shutdown Coordinator

**Story Points:** 3

**Dependencies:** S-RUNTIME-02

**Description:**
Implement signal handlers for SIGTERM/SIGINT that coordinate shutdown across the uvicorn server and any running async tasks. Ensure in-flight requests complete before exit.

**Acceptance Criteria:**

| #   | Criterion                                              | Verification Method            |
| --- | ------------------------------------------------------ | ------------------------------ |
| 1   | `systemctl stop claudehome-api` logs shutdown sequence | `journalctl -u claudehome-api` |
| 2   | In-flight requests complete (up to 30s)                | Load test + stop               |
| 3   | Exit code 0 on clean shutdown                          | Service status                 |
| 4   | Shutdown timeout configurable                          | Environment variable           |
| 5   | Agent loop exits cleanly on shutdown                   | Log inspection                 |

**Implementation Reference:**

```python
# /claude-home/runner/api/lifecycle.py
import asyncio

import structlog

logger = structlog.get_logger()


class GracefulShutdown:
    """Coordinates graceful shutdown across async tasks."""

    def __init__(self, timeout: float = 30.0) -> None:
        self._triggered = False
        self._event = asyncio.Event()
        self._timeout = timeout

    @property
    def is_triggered(self) -> bool:
        return self._triggered

    def trigger(self) -> None:
        if self._triggered:
            return
        logger.info("shutdown_triggered")
        self._triggered = True
        self._event.set()

    async def wait(self, timeout: float | None = None) -> bool:
        t = timeout if timeout is not None else self._timeout
        try:
            await asyncio.wait_for(self._event.wait(), timeout=t)
            return True
        except asyncio.TimeoutError:
            logger.warning("shutdown_timeout", timeout_seconds=t)
            return False
```

---

## Implementation Order

| Order | Story ID     | Title                       | Points |
| ----- | ------------ | --------------------------- | ------ |
| 1     | S-RUNTIME-01 | FastAPI Skeleton & Lifespan | 2      |
| 2     | S-RUNTIME-04 | Health Probes               | 2      |
| 3     | S-RUNTIME-02 | Non-Blocking uvicorn        | 5      |
| 4     | S-RUNTIME-05 | Graceful Shutdown           | 3      |
| 5     | S-RUNTIME-03 | Caddy & systemd             | 3      |

**Total Story Points:** 15

---

## Verification Commands

### On VPS

```bash
# Test API locally
curl http://127.0.0.1:8000/api/v1/health/live
curl http://127.0.0.1:8000/api/v1/health/ready

# Test via Caddy (after S-RUNTIME-03)
curl https://api.claudehome.dineshd.dev/api/v1/health/live

# Check service status
systemctl status claudehome-api
journalctl -u claudehome-api -f

# Test CORS
curl -I -H "Origin: https://claudehome.dineshd.dev" https://api.claudehome.dineshd.dev/api/v1/health/live

# Test graceful shutdown
systemctl stop claudehome-api
journalctl -u claudehome-api | tail -20
```

### From Vercel/External

```bash
# Health check
curl https://api.claudehome.dineshd.dev/api/v1/health/live

# Readiness
curl https://api.claudehome.dineshd.dev/api/v1/health/ready
```

---

## Out of Scope

- Anthropic API integration (future epic)
- Session endpoints (future epic)
- Content endpoints for thoughts/dreams (future epic)
- WebSocket real-time updates (future epic)
- Authentication/authorization
- Rate limiting
- Metrics/tracing

---

## Definition of Done

- [ ] `/claude-home/runner/api/` directory created with all modules
- [ ] Dependencies installed in existing venv
- [ ] `python -m api` starts server on `127.0.0.1:8000`
- [ ] Health probes functional
- [ ] CORS configured for Vercel domain
- [ ] Caddy installed and configured
- [ ] HTTPS working with valid certificate
- [ ] systemd service created and enabled
- [ ] Firewall configured (80, 443 open; 8000 closed)
- [ ] Graceful shutdown verified
- [ ] All code has type hints and docstrings
- [ ] No AI attribution in any files

---

## DNS Requirement

Before S-RUNTIME-03, ensure DNS is configured:

```
api.claudehome.dineshd.dev  A  157.180.94.145
```

If no domain is available, use IP-based setup with self-signed certs for testing, then add domain later.

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [systemd Service Files](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [UFW Firewall](https://help.ubuntu.com/community/UFW)

---

_This epic is governed by CLAUDE.md. Implementation occurs on VPS, not local repository._
