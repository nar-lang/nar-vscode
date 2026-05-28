#!/usr/bin/env bash
# Build official Lua 5.4 from source for a single target platform/arch.
# Usage:
#   tools/build-lua.sh <target>
# where <target> is one of:
#   darwin-arm64, darwin-x64, linux-x64, linux-arm64
#
# (Windows binaries are taken from LuaBinaries SourceForge instead, see
# tools/fetch-lua-windows.sh.)
#
# The script downloads the official source tarball from lua.org, builds it
# with the platform-appropriate Makefile target, and copies the resulting
# binary into bin/<target>/lua.
#
# Linux builds intentionally do NOT link against libreadline so the resulting
# binary runs on minimal distros that don't ship readline.

set -euo pipefail

LUA_VERSION="${LUA_VERSION:-5.4.7}"
TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
    echo "usage: $0 <darwin-arm64|darwin-x64|linux-x64|linux-arm64>" >&2
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
        ;;
    linux-x64|linux-arm64)
        # `posix` target = POSIX without readline. Builds a self-contained
        # binary that runs on any modern Linux without depending on
        # libreadline (which is NOT installed by default on many distros).
        make -C src clean
        make -C src \
            MYCFLAGS=-DLUA_USE_POSIX \
            MYLIBS= \
            SYSCFLAGS= SYSLIBS= SYSLDFLAGS= posix
        ;;
    *)
        echo "unknown target: $TARGET" >&2
        exit 2
        ;;
esac

DEST_DIR="$ROOT_DIR/bin/$TARGET"
mkdir -p "$DEST_DIR"
cp src/lua "$DEST_DIR/lua"
chmod +x "$DEST_DIR/lua"

echo "==> Built $DEST_DIR/lua"
file "$DEST_DIR/lua" || true
"$DEST_DIR/lua" -v || true
