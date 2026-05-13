# syntax=docker/dockerfile:1.4

# 1단계: Node로 빌드
FROM node:20-alpine AS builder
WORKDIR /app

# 패키지 설치
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# 소스 복사 후 빌드 (환경 변수는 빌드 시 --build-arg 로 넘기거나, 기본값 사용)
### <------ 수정 필요: 환경변수 ------>
ARG VITE_AUTH_SERVER_BASE_URL
ARG VITE_FRONTEND_BASE_URL
ARG VITE_API_BASE_URL
ARG VITE_BASE_PATH
ENV VITE_AUTH_SERVER_BASE_URL=$VITE_AUTH_SERVER_BASE_URL
ENV VITE_FRONTEND_BASE_URL=$VITE_FRONTEND_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BASE_PATH=$VITE_BASE_PATH
### <------ 수정 필요: 환경변수 ------>

COPY . .
RUN pnpm build

# 2단계: 빌드 결과만 nginx로 서빙
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
# SubPath(/appfn) 지원 nginx 설정
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

COPY --chmod=755 <<-"EOF" /docker-entrypoint.d/40-replace-env.sh
#!/bin/sh
### <------ 수정 필요: html 파일 내부 하드코딩된 부분 동적으로 변경 ------>
find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|__VITE_BASE_PATH__|${VITE_BASE_PATH}|g" {} +
find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|__VITE_FRONTEND_BASE_URL__|${VITE_FRONTEND_BASE_URL}|g" {} +
find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|__VITE_AUTH_SERVER_BASE_URL__|${VITE_AUTH_SERVER_BASE_URL}|g" {} +
find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|__VITE_API_BASE_URL__|${VITE_API_BASE_URL}|g" {} +
EOF
### <------ 수정 필요: 환경변수 ------>

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]