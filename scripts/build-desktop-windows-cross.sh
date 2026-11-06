#!/usr/bin/env bash
set -e

# ==============================================================================
# RightTouch Admin - Cross-Compile Windows Desktop App (.exe) on Linux via Tauri
# ==============================================================================

echo "=========================================================="
echo " RightTouch Desktop: Building Windows (.exe) on Linux"
echo "=========================================================="

# 1. Check or install Rust
if ! command -v rustc &> /dev/null; then
  if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
  else
    echo ">> Installing Rust toolchain..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
  fi
fi

# 2. Add Windows GNU target
echo ">> Ensuring Rust Windows GNU target is added..."
rustup target add x86_64-pc-windows-gnu

# 3. Check for MinGW and NSIS
MISSING_PKGS=()
if ! command -v x86_64-w64-mingw32-gcc &> /dev/null; then
  MISSING_PKGS+=("g++-mingw-w64-x86-64")
fi
if ! command -v makensis &> /dev/null; then
  MISSING_PKGS+=("nsis")
fi

if [ ${#MISSING_PKGS[@]} -gt 0 ]; then
  echo ""
  echo ">> Missing required cross-compilation packages: ${MISSING_PKGS[*]}"
  echo ">> Please run:"
  echo "     sudo apt update && sudo apt install -y ${MISSING_PKGS[*]}"
  echo ""
  exit 1
fi

# 4. Build React frontend
echo ">> Building production web assets..."
npm run build

# 5. Build Tauri Windows Executable & NSIS Setup
echo ">> Building Windows NSIS executable via Tauri..."
npm run desktop:build:windows

echo ""
echo "=========================================================="
echo " SUCCESS: Windows desktop build complete!"
echo " Installer location: src-tauri/target/x86_64-pc-windows-gnu/release/bundle/nsis/"
echo "=========================================================="
