#!/bin/sh
set -e

mkdir -p /app/data
# (Ensure the "node" user can read/write the DB folder once the volume is attached)
chown -R node:node /app/data

exec su-exec node:node node server/index.js