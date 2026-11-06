#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  RightTouch Admin - Desktop Build for Linux (Tauri)     "
echo "=========================================================="

# 1. Check or install Rust
if ! command -v cargo &> /dev/null; then
  if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
  fi
fi

if ! command -v cargo &> /dev/null; then
  echo ""
  echo " Rust toolchain not found. Installing Rust via rustup..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  source "$HOME/.cargo/env"
fi

echo "✓ Rust version: $(rustc --version)"
echo "✓ Cargo version: $(cargo --version)"

# 2. Check required Linux system packages
MISSING_PKGS=()
for pkg in libwebkit2gtk-4.1-dev libgtk-3-dev libappindicator3-dev librsvg2-dev; do
  if ! dpkg -s "$pkg" &> /dev/null; then
    MISSING_PKGS+=("$pkg")
  fi
done

if [ ${#MISSING_PKGS[@]} -gt 0 ]; then
  echo ""
  echo "⚠️  Missing Linux development packages required by Tauri WebKit:"
  echo "    ${MISSING_PKGS[*]}"
  echo ""
  echo "Please run this command with sudo to install them:"
  echo "    sudo apt-get update && sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev libappindicator3-dev librsvg2-dev patchelf"
  echo ""
  exit 1
fi

# 3. Build React frontend
echo ""
echo " Building React frontend..."
npm run build

# 4. Build Tauri Desktop Bundle
echo ""
echo " Building Tauri Desktop Application (.deb & .AppImage)..."
npm run desktop:build

echo ""
echo "=========================================================="
echo "  Build Complete! Binaries are located in:                "
echo "  src-tauri/target/release/bundle/                       "
echo "  - Debian package (.deb): src-tauri/target/release/bundle/deb/"
echo "  - AppImage (.AppImage):  src-tauri/target/release/bundle/appimage/"
echo "=========================================================="
