#!/usr/bin/env bash
set -e

# ==============================================================================
# RightTouch Admin - Linux Desktop Local Build Script
# ==============================================================================

echo "=========================================================="
echo " RightTouch Desktop: Building for Linux (.deb & .AppImage)"
echo "=========================================================="

# 1. Check for Rust
if ! command -v rustc &> /dev/null; then
  if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
  else
    echo ">> Installing Rust toolchain..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
  fi
fi

# 2. Build web assets
echo ">> Compiling React frontend..."
npm run build

# 3. Build Tauri bundle
echo ">> Packaging native Linux application with Tauri..."
npm run desktop:build

echo ""
echo "=========================================================="
echo " SUCCESS: Linux desktop packages generated!"
echo " Location:"
echo "   DEB:      src-tauri/target/release/bundle/deb/"
echo "   AppImage: src-tauri/target/release/bundle/appimage/"
echo "=========================================================="
