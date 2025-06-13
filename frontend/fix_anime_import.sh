#!/bin/bash

echo "📁 Scanning ./src for animejs default import..."
find src -type f -name "*.js" -print0 | while IFS= read -r -d '' file; do
  if grep -q "import anime from 'animejs'" "$file"; then
    echo "🔧 Patching: $file"
    sed -i "s|import anime from 'animejs'|import * as anime from 'animejs'|" "$file"
  fi
done

echo "📦 Reinstalling deps (safe rebuild)..."
npm install

echo "🚧 Building..."
npm run build

echo "✅ animejs import patched + app rebuilt. You may now commit."
