#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "File .env dibuat dari .env.example. Isi PAYPAL_CLIENT_ID dan PAYPAL_CLIENT_SECRET."
fi

if [[ ! -d node_modules ]]; then
  npm install
fi

npm start
