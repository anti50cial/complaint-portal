#!/usr/bin/env bash

set -euo pipefail

readonly default_api_base_url="/api"
backend_origin="${NETLIFY_API_BASE_URL:-}"
api_base_url="$default_api_base_url"

if [[ -n "$backend_origin" ]]; then
  backend_origin="${backend_origin%/}"
fi

if [[ "${NETLIFY:-}" == "true" && -z "$backend_origin" ]]; then
  echo "NETLIFY_API_BASE_URL must be set for Netlify deployments." >&2
  exit 1
fi

if [[ -n "$backend_origin" && ! "$backend_origin" =~ ^https?:// ]]; then
  echo "NETLIFY_API_BASE_URL must start with http:// or https://." >&2
  exit 1
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

if [[ -n "$backend_origin" ]]; then
  cat > "dist/frontend/browser/_redirects" <<EOF
/api/* ${backend_origin}/:splat 200
/* /index.html 200
EOF
fi
