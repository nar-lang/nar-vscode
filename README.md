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

You need a [Lua 5.4](https://www.lua.org/) interpreter on your `PATH`
(or point `nar.lsp.lua` at one explicitly). The Nar compiler itself
([`lunar`](https://github.com/nar-lang/lunar)) is **bundled** with the
extension as a git submodule, so end users don't need a separate
checkout. The CLI is auto-discovered in this order:

1. `nar.lsp.path` user setting (absolute path to `lunar/cli/init.lua`)
2. `LUNAR_CLI` environment variable
3. Bundled copy shipped with the extension (`<extension>/lunar/cli/init.lua`)
4. Heuristic walk up from each workspace folder looking for `lunar/cli/init.lua`

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `nar.lsp.path` | `""` | Absolute path to `lunar/cli/init.lua`. |
| `nar.lsp.lua`  | `"lua"` | Lua interpreter binary used to run the server. |
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

## License

MIT — see [LICENSE](./LICENSE).
