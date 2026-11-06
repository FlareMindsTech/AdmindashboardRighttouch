# RightTouch Desktop Application (Tauri v2)

This project is now configured as a native cross-platform desktop application using **Tauri v2** for **Windows** (`.exe`, `.msi`) and **Linux** (`.deb`, `.AppImage`).

---

## 🚀 1. Desktop Scripts

New npm commands have been added to your `package.json`:

| Command | Purpose |
| :--- | :--- |
| `npm run desktop:dev` | Starts the React dev server and launches the live desktop window with hot reload |
| `npm run desktop:build` | Compiles the React production build and packages the native desktop installer / binary |
| `npm run tauri -- <args>` | Directly invoke the Tauri v2 CLI (e.g. `npm run tauri info`) |

---

## 🐧 2. Building on Linux (Ubuntu / Debian)

### Prerequisites (one-time setup):
Tauri requires Rust and WebKitGTK development headers. Run the following command in your terminal:

```bash
# 1. Install Linux WebKitGTK and GTK3 dev libraries
sudo apt-get update && sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf \
  build-essential \
  curl \
  wget \
  file

# 2. Install Rust toolchain (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
```

### Build Command:
You can use the helper script or run npm directly:
```bash
./scripts/build-desktop-linux.sh
```
or:
```bash
npm run desktop:build
```

### Output Location:
After the build completes, your Linux bundles will be in:
- **Debian package (`.deb`)**: `src-tauri/target/release/bundle/deb/`
- **Portable AppImage (`.AppImage`)**: `src-tauri/target/release/bundle/appimage/`

---

## 🪟 3. Building for Windows (`.exe` / `.msi`)

### Option A: Automated GitHub Actions CI/CD (Recommended)
A pre-configured GitHub Actions workflow is included at `.github/workflows/release-desktop.yml`.

Whenever you push a tag or trigger the workflow manually:
1. It spins up a `windows-latest` VM and compiles Windows **NSIS installer (`.exe`)** and **MSI package (`.msi`)**.
2. It spins up an `ubuntu-22.04` VM and compiles Linux **`.deb`** and **`.AppImage`**.
3. It automatically attaches all binaries to a GitHub Release ready for instant download.

To trigger a release:
```bash
git tag v1.0.3
git push origin v1.0.3
```
Or go to your GitHub repository -> **Actions** -> **Release Desktop Apps** -> **Run workflow**.

---

### Option B: Building Locally on a Windows Machine
If you or a team member are on a Windows machine:
1. Install [Node.js](https://nodejs.org/) (v18+) and [Rust](https://www.rust-lang.org/tools/install) (via `rustup-init.exe`).
2. Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (select "Desktop development with C++").
3. In the project directory, run:
   ```bash
   npm install
   npm run desktop:build
   ```
4. Output installers will be generated under:
   - `src-tauri\target\release\bundle\nsis\RightTouchAdmin_1.0.3_x64-setup.exe`
   - `src-tauri\target\release\bundle\msi\RightTouchAdmin_1.0.3_x64_en-US.msi`

---

### Option C: Cross-Compiling for Windows Directly on Linux
You can also generate the Windows `.exe` installer directly from your Linux terminal using MinGW-w64 and NSIS:

1. Install cross-compilation tools:
   ```bash
   sudo apt-get update && sudo apt-get install -y nsis lld llvm clang g++-mingw-w64-x86-64
   ```
2. Run the Windows build script:
   ```bash
   ./scripts/build-desktop-windows-cross.sh
   ```
   *(or `npm run desktop:build:windows`)*
3. Output executable installer:
   - `src-tauri/target/x86_64-pc-windows-gnu/release/bundle/nsis/RightTouchAdmin_1.0.3_x64-setup.exe`

---

## ⚙️ 4. Configuration Highlights (`src-tauri/tauri.conf.json`)

- **Application Identifier**: `com.righttouch.admin`
- **Default Window Dimensions**: `1400 x 900` (Minimum `1024 x 700`, centered)
- **Branded Icons**: Fully pre-generated from `Right_Touch.png` (`.ico` for Windows, `.png` for Linux, `.icns` for macOS).
- **Frontend Distribution**: Bundles `../build` output automatically before packaging.
