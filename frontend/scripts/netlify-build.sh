#!/usr/bin/env bash

set -euo pipefail

readonly default_api_base_url="/api"
api_base_url="${NETLIFY_API_BASE_URL:-$default_api_base_url}"
api_base_url="${api_base_url%/}"

if [[ -z "$api_base_url" ]]; then
  api_base_url="$default_api_base_url"
fi

escaped_api_base_url="${api_base_url//\\/\\\\}"
escaped_api_base_url="${escaped_api_base_url//\"/\\\"}"
bun_cmd="${HOME}/.bun/bin/bun"

if [[ ! -x "$bun_cmd" ]]; then
  bun_cmd="bun"
fi

"$bun_cmd" install --frozen-lockfile
"$bun_cmd" run ng build --verbose

cp "dist/frontend/browser/index.csr.html" "dist/frontend/browser/index.html"

cat > "dist/frontend/browser/app-config.js" <<EOF
window.__APP_CONFIG__ = {
  apiBaseUrl: "${escaped_api_base_url}"
};
EOF
