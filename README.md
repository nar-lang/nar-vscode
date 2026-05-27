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

You need:

1. A [Lua 5.4](https://www.lua.org/) interpreter on your `PATH`
   (or set `nar.lsp.lua` to its absolute path).
2. A checkout of the [`lunar`](https://github.com/nar-lang/lunar) repository.
   The extension will look for `lunar/cli/init.lua` walking up from each
   workspace folder. You can also point it explicitly via the `nar.lsp.path`
   setting or the `LUNAR_CLI` environment variable.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `nar.lsp.path` | `""` | Absolute path to `lunar/cli/init.lua`. |
| `nar.lsp.lua`  | `"lua"` | Lua interpreter binary used to run the server. |
| `nar.lsp.args` | `[]` | Extra CLI args inserted before `--lsp`. |
| `nar.trace.server` | `"off"` | Trace level for the LSP communication output channel. |

## Development

```sh
npm install
npm run compile
# Open this folder in VS Code, press F5 to launch the Extension Development Host.
```

## License

MIT — see [LICENSE](./LICENSE).
