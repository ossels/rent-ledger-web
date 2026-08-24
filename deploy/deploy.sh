#!/usr/bin/env bash
# Deploy RentLedger to the VPS that also hosts invoicy.
#
#   ./deploy/deploy.sh            # pull latest main and (re)build the stack
#
# First-time server setup is done automatically: clone into /opt/rentledger and
# generate /opt/rentledger/.env with fresh secrets if it does not exist yet.
set -euo pipefail

HOST="${DEPLOY_HOST:-root@72.62.181.179}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/invoicy_deploy}"
DIR=/opt/rentledger
REPO=https://github.com/ossels/rent-ledger-web.git

ssh -i "$KEY" "$HOST" bash -s <<'REMOTE'
set -euo pipefail
DIR=/opt/rentledger
REPO=https://github.com/ossels/rent-ledger-web.git

if [ ! -d "$DIR/.git" ]; then
  git clone "$REPO" "$DIR"
fi
cd "$DIR"
git fetch origin main
git reset --hard origin/main

if [ ! -f .env ]; then
  PG_PW=$(openssl rand -hex 24)
  JWT=$(openssl rand -base64 48 | tr -d '\n')
  cat > .env <<EOF
POSTGRES_USER=rentledger
POSTGRES_PASSWORD=$PG_PW
POSTGRES_DB=rentledger
DATABASE_URL=postgresql://rentledger:$PG_PW@db:5432/rentledger?schema=public
JWT_SECRET=$JWT
PUBLIC_APP_URL=https://rentledger.ossels.ai
FRONTEND_PORT=3003
EOF
  chmod 600 .env
  echo "Generated fresh $DIR/.env"
fi

docker compose -f docker-compose.prod.yml -f deploy/docker-compose.traefik.yml up -d --build
docker compose -f docker-compose.prod.yml ps
REMOTE
