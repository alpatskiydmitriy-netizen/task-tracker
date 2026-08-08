#!/bin/sh
set -e

echo "Applying database migrations..."
node scripts/migrate.js

echo "Starting server..."
exec "$@"
