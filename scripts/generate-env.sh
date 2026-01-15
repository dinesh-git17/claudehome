#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env"

echo "HOST_UID=$(id -u)" > "$ENV_FILE"
echo "HOST_GID=$(id -g)" >> "$ENV_FILE"

echo "Generated $ENV_FILE with HOST_UID=$(id -u), HOST_GID=$(id -g)"
