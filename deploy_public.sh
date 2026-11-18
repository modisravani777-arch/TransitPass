#!/usr/bin/env bash
# TransitPass - Instant Public Deployment Script
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=== Starting TransitPass Full-Stack Deployment ==="

# 1. Download cloudflared if not present
if [ ! -f /tmp/cloudflared ]; then
  echo "Downloading cloudflared..."
  curl -sSL -o /tmp/cloudflared.tgz https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz
  tar -xzf /tmp/cloudflared.tgz -C /tmp
fi

# 2. Start Backend
echo "Starting Express API on port 5000..."
cd "$DIR/server"
node -e "const net = require('net'); const orig = net.Server.prototype.listen; net.Server.prototype.listen = function(...args) { if ((typeof args[0] === 'number' || typeof args[0] === 'string') && (args.length === 1 || typeof args[1] === 'function')) { args.splice(1, 0, '127.0.0.1'); } return orig.apply(this, args); }; require('./src/index.js');" &
BACKEND_PID=$!

# 3. Start Frontend
echo "Starting Vite Frontend on port 5173..."
cd "$DIR/client"
NODE_OPTIONS="--dns-result-order=ipv4first" npx vite --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

sleep 3

# 4. Start Tunnel
echo "Starting Cloudflare Public HTTPS Tunnel..."
/tmp/cloudflared tunnel --url http://127.0.0.1:5173 --http-host-header localhost:5173

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
