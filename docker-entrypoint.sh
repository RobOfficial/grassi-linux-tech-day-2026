#!/bin/sh
set -e

echo "[entrypoint] applying prisma migrations..."
npx prisma migrate deploy || npx prisma db push --accept-data-loss

if [ "$RUN_SEED" = "1" ]; then
  echo "[entrypoint] running seed..."
  npx tsx prisma/seed.ts || true
fi

exec "$@"
