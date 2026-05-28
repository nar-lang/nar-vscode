#!/usr/bin/env bash
# Download Windows x64 Lua 5.4 from LuaBinaries (SourceForge) into
# bin/win32-x64/. Ships both lua.exe and lua54.dll (the exe depends on it).
#
# Usage: tools/fetch-lua-windows.sh

set -euo pipefail

LUA_VERSION="${LUA_VERSION:-5.4.8}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST_DIR="$ROOT_DIR/bin/win32-x64"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

URL="https://sourceforge.net/projects/luabinaries/files/${LUA_VERSION}/Tools%20Executables/lua-${LUA_VERSION}_Win64_bin.zip/download"

echo "==> Downloading $URL"
curl -fsSL "$URL" -o "$WORK_DIR/win64.zip"

unzip -q -o "$WORK_DIR/win64.zip" -d "$WORK_DIR/win64"

mkdir -p "$DEST_DIR"
cp "$WORK_DIR/win64/lua${LUA_VERSION%%.*}${LUA_VERSION#*.}.exe" "$DEST_DIR/lua.exe" 2>/dev/null \
    || cp "$WORK_DIR/win64/lua54.exe" "$DEST_DIR/lua.exe"
cp "$WORK_DIR/win64/lua54.dll" "$DEST_DIR/lua54.dll"

echo "==> Installed $DEST_DIR/lua.exe + lua54.dll"
ls -la "$DEST_DIR/"
