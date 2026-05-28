# Nar Language Support for VS Code

[Nar](https://github.com/nar-lang) is an ML-style functional language compiled by
the [`lunar`](https://github.com/nar-lang/lunar) toolchain. This extension adds
first-class Nar editing to Visual Studio Code.

## Features

- **Syntax highlighting** for `.nar` files (modules, imports, defs, aliases,
  types, infix declarations, doc comments).
- **Diagnostics**: parse errors are surfaced live as you type.
- **Hover**: signatures plus `///` doc comments for top-level definitions,
  aliases, data types, and infix operators across the open workspace.
- **Go to Definition** across files.
- **Find References** (workspace-wide identifier search).
- **Outline / Document Symbols** for the breadcrumb bar and symbol picker.
- **Completion**: top-level identifiers from the indexed workspace.
- **Semantic tokens**: extra coloring for declarations on supported themes.

All language services are powered by the [`lunar`](https://github.com/nar-lang/lunar)
compiler running as a JSON-RPC LSP server (`lua lunar/cli/init.lua --lsp`).

## Requirements

None for typical use. The extension **bundles** both:

- the [`lunar`](https://github.com/nar-lang/lunar) compiler (as a git submodule), and
- an official [Lua 5.4](https://www.lua.org/) interpreter for every supported
  platform (`darwin-arm64`, `darwin-x64`, `linux-x64`, `linux-arm64`,
  `win32-x64`).

The bundled Lua is picked automatically at activation based on `process.platform`
and `process.arch`. If you'd rather use a Lua interpreter from your system,
set `nar.lsp.lua` to its path (or to `"lua"` for a PATH lookup).

The `lunar` CLI is auto-discovered in this order:

1. `nar.lsp.path` user setting (absolute path to `lunar/cli/init.lua`)
2. `LUNAR_CLI` environment variable
3. Bundled copy shipped with the extension (`<extension>/lunar/cli/init.lua`)
4. Heuristic walk up from each workspace folder looking for `lunar/cli/init.lua`

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `nar.lsp.path` | `""` | Absolute path to `lunar/cli/init.lua`. Supports `${workspaceFolder}` and `${workspaceFolder:name}`. |
| `nar.lsp.lua`  | `""` | Lua interpreter binary used to run the server. When empty, uses the bundled Lua 5.4 for your platform; falls back to `lua` on `PATH` if no bundled binary is available. |
| `nar.lsp.args` | `[]` | Extra CLI args inserted before `--lsp`. |
| `nar.trace.server` | `"off"` | Trace level for the LSP communication output channel. |

## Development

```sh
git clone --recurse-submodules https://github.com/nar-lang/nar-vscode.git
cd nar-vscode
npm install
npm run compile
# Open this folder in VS Code, press F5 to launch the Extension Development Host.
```

To refresh the bundled compiler later:

```sh
git submodule update --remote lunar
```

### Bundled Lua binaries

The `bin/<platform>-<arch>/` directories hold the prebuilt Lua 5.4
interpreter for each supported VS Code platform. They are sourced as
follows:

| Platform | Source |
| --- | --- |
| `darwin-arm64`, `darwin-x64`, `linux-x64`, `linux-arm64` | Built from [official lua.org source](https://www.lua.org/ftp/) via [`tools/build-lua.sh <target>`](./tools/build-lua.sh) |
| `win32-x64` | [LuaBinaries](https://luabinaries.sourceforge.net/) Win64 release, downloaded by [`tools/fetch-lua-windows.sh`](./tools/fetch-lua-windows.sh) |

A GitHub Actions workflow [`.github/workflows/build-lua.yml`](./.github/workflows/build-lua.yml)
fans these jobs out across native macOS/Linux runners and uploads a
combined `lua-bundle` artifact you can download and drop into `bin/`.

## License

MIT — see [LICENSE](./LICENSE).
