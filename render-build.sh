#!/usr/bin/env bash
# 빌드 시작 전 디버깅 정보
echo "Build script starting..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 서버 설치
echo "Installing server dependencies..."
cd server
npm install
cd ..

# 웹 빌드
echo "Installing and building web frontend..."
cd web
npm install
npm run build
cd ..

echo "Build script completed."
