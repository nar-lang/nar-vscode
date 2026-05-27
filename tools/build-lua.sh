#!/usr/bin/env bash
# Build official Lua 5.4 from source for a single target platform/arch.
# Usage:
#   tools/build-lua.sh <target>
# where <target> is one of:
#   darwin-arm64, darwin-x64, linux-x64, linux-arm64, win32-x64
#
# The script downloads the official source tarball from lua.org, builds it
# with the platform-appropriate Makefile target, and copies the resulting
# binary into bin/<target>/lua[.exe].
#
# Designed to be runnable both locally and in CI (one job per target).

set -euo pipefail

LUA_VERSION="${LUA_VERSION:-5.4.7}"
TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
    echo "usage: $0 <darwin-arm64|darwin-x64|linux-x64|linux-arm64|win32-x64>" >&2
    exit 2
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "==> Downloading Lua $LUA_VERSION source"
cd "$WORK_DIR"
curl -fsSL "https://www.lua.org/ftp/lua-${LUA_VERSION}.tar.gz" -o lua.tar.gz
tar xzf lua.tar.gz
cd "lua-${LUA_VERSION}"

case "$TARGET" in
    darwin-arm64)
        make macosx -j"$(sysctl -n hw.ncpu)"
        OUT="src/lua"; EXE="lua"
        ;;
    darwin-x64)
        # Cross-compile from arm64 host using clang -arch x86_64. Works fine
        # for tiny pure-C programs like Lua. On an x64 host, this is the
        # native build.
        make -C src clean
        make -C src \
            CC="clang -arch x86_64" \
            MYCFLAGS="-DLUA_USE_MACOSX -DLUA_USE_READLINE" \
            MYLIBS="-lreadline" \
            SYSCFLAGS= SYSLIBS= SYSLDFLAGS= macosx
        OUT="src/lua"; EXE="lua"
        ;;
    linux-x64|linux-arm64)
        # `linux` Makefile target. CI runner for arm64 must already be arm64.
        make linux -j"$(nproc)"
        OUT="src/lua"; EXE="lua"
        ;;
    win32-x64)
        # Build via mingw-w64. Requires x86_64-w64-mingw32-gcc on PATH.
        make -C src clean
        make -C src \
            CC=x86_64-w64-mingw32-gcc \
            AR="x86_64-w64-mingw32-ar rcu" \
            RANLIB=x86_64-w64-mingw32-ranlib \
            MYCFLAGS="-DLUA_BUILD_AS_DLL" \
            SYSCFLAGS= SYSLIBS= SYSLDFLAGS="-static" \
            mingw
        OUT="src/lua.exe"; EXE="lua.exe"
        ;;
    *)
        echo "unknown target: $TARGET" >&2
        exit 2
        ;;
esac

DEST_DIR="$ROOT_DIR/bin/$TARGET"
mkdir -p "$DEST_DIR"
cp "$OUT" "$DEST_DIR/$EXE"
chmod +x "$DEST_DIR/$EXE" || true

echo "==> Built $DEST_DIR/$EXE"
file "$DEST_DIR/$EXE" || true
"$DEST_DIR/$EXE" -v || true
