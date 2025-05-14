#!/bin/bash

# 필요한 JSON 파일 목록
FILES=(
  "./package.json"
  "./server/package.json"
  "./web/package.json"
  "./app/package.json"
)

# 각 파일 검증
for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    echo "Validating $file..."
    if node -e "try { JSON.parse(require('fs').readFileSync('$file', 'utf8')); console.log('Valid JSON!'); } catch(e) { console.error('Invalid JSON:', e.message); process.exit(1); }"; then
      echo "✅ $file is valid JSON"
    else
      echo "❌ $file is NOT valid JSON"
      exit 1
    fi
  else
    echo "⚠️ $file does not exist, skipping..."
  fi
done

echo "All JSON files validated successfully!"
