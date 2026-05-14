# syntax=docker/dockerfile:1.4

# 1단계: Node로 빌드
FROM node:20-alpine AS builder
WORKDIR /app

# 패키지 설치
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# 소스 복사 후 빌드
COPY . .
RUN pnpm build

# 2단계: 빌드 결과만 nginx로 서빙
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

COPY --chmod=755 <<-"EOF" /docker-entrypoint.d/40-runtime-env.sh
#!/bin/sh

set -eu

escape_js() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

write_env() {
  key="$1"
  eval "raw_value=\${$key:-}"
  value="$(escape_js "$raw_value")"
  printf '  "%s": "%s",\n' "$key" "$value"
}

{
  printf 'window.__KNU_RUNTIME_ENV__ = {\n'
  write_env VITE_API_BASE_URL
  write_env VITE_API_TIMEOUT_MS
  write_env VITE_SENTRY_DSN
  write_env VITE_PUBLIC_POSTHOG_KEY
  write_env VITE_PUBLIC_POSTHOG_HOST
  write_env VITE_GA_ID
  write_env VITE_CLARITY_ID
  printf '};\n'
} > /usr/share/nginx/html/runtime-env.js
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
