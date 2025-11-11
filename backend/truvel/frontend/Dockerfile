# 1단계: 빌드 환경
FROM node:22-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 종속성 설치를 위해 필요한 파일 복사
COPY package.json package-lock.json* ./

# 종속성 설치
RUN npm install

# 나머지 소스 코드 복사
COPY . .

# Next.js 앱 빌드
RUN npm run build

# 2단계: 실행 환경
FROM node:22-alpine AS runner

WORKDIR /app

# production 모드로 실행 시 불필요한 파일 최소화
ENV NODE_ENV production

# 필요한 파일만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 포트 설정 (Next.js 기본 포트: 3000)
EXPOSE 3000

# 앱 실행
CMD ["npm", "start"]
