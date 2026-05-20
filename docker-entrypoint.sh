#!/bin/sh
set -e

PRISMA_BIN="node /app/node_modules/prisma/build/index.js"

echo "[entrypoint] applying prisma migrations..."
$PRISMA_BIN migrate deploy || $PRISMA_BIN db push --accept-data-loss

if [ "$RUN_SEED" = "1" ]; then
  echo "[entrypoint] running seed..."
  node /app/prisma/seed.mjs || echo "[entrypoint] seed failed (continuo comunque)"
fi

exec "$@"
