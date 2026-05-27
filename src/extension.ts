import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;

/** Try to discover the lunar CLI script. Priority:
 *  1. user setting `nar.lsp.path`
 *  2. `LUNAR_CLI` env var
 *  3. bundled copy under the extension (`<ext>/lunar/cli/init.lua`),
 *     populated by the git submodule / .vsix bundle
 *  4. heuristic search up the workspace tree for a `lunar/cli/init.lua`
 */
function findLunarScript(extensionPath: string): string | undefined {
    const cfg = vscode.workspace.getConfiguration("nar");
    const configured = expandPath(cfg.get<string>("lsp.path") || "");
    if (configured && fs.existsSync(configured)) {
        return configured;
    }

    const env = process.env["LUNAR_CLI"];
    if (env && fs.existsSync(env)) {
        return env;
    }

    const bundled = path.join(extensionPath, "lunar", "cli", "init.lua");
    if (fs.existsSync(bundled)) {
        return bundled;
    }

    // Walk up from each workspace folder looking for `lunar/cli/init.lua`.
    const folders = vscode.workspace.workspaceFolders;
    if (folders) {
        for (const f of folders) {
            let dir = f.uri.fsPath;
            for (let i = 0; i < 10; i++) {
                const candidate = path.join(dir, "lunar", "cli", "init.lua");
                if (fs.existsSync(candidate)) {
                    return candidate;
                }
                const parent = path.dirname(dir);
                if (parent === dir) break;
                dir = parent;
            }
        }
    }

    return undefined;
}

/** Pick the bundled lua binary that matches the current platform/arch. Returns
 *  undefined when no bundled binary exists for this platform (the extension
 *  will then fall back to PATH lookup / user-configured interpreter). */
function findBundledLua(extensionPath: string): string | undefined {
    const platform = process.platform; // "darwin" | "linux" | "win32" | ...
    const arch = process.arch;         // "arm64" | "x64" | ...
    const exe = platform === "win32" ? "lua.exe" : "lua";
    const dir = `${platform}-${arch}`;
    const candidate = path.join(extensionPath, "bin", dir, exe);
    if (!fs.existsSync(candidate)) {
        return undefined;
    }
    // Ensure exec bit on POSIX (vsce sometimes drops it).
    if (platform !== "win32") {
        try {
            const st = fs.statSync(candidate);
            if ((st.mode & 0o111) === 0) {
                fs.chmodSync(candidate, st.mode | 0o755);
            }
        } catch {
            // best-effort; ignore
        }
    }
    return candidate;
}

// Replace ${workspaceFolder} (and ${workspaceFolder:name}) with the matching
// workspace path. Returns "" when the input is empty.
function expandPath(input: string): string {
    if (!input) return "";
    const folders = vscode.workspace.workspaceFolders || [];
    return input
        .replace(/\$\{workspaceFolder\}/g,
            folders.length > 0 ? folders[0].uri.fsPath : "")
        .replace(/\$\{workspaceFolder:([^}]+)\}/g, (_, name) => {
            const match = folders.find(f => f.name === name);
            return match ? match.uri.fsPath : "";
        });
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const cfg = vscode.workspace.getConfiguration("nar");
    const userLua = cfg.get<string>("lsp.lua") || "";
    const extraArgs = cfg.get<string[]>("lsp.args") || [];

    // Pick interpreter: explicit user setting wins, otherwise prefer the
    // bundled binary for this platform, otherwise fall back to PATH `lua`.
    let luaInterpreter = userLua;
    if (!luaInterpreter) {
        luaInterpreter = findBundledLua(context.extensionPath) || "lua";
    }

    const lunarScript = findLunarScript(context.extensionPath);
    if (!lunarScript) {
        const choice = await vscode.window.showWarningMessage(
            "Nar: could not locate the lunar CLI script. Try reinstalling the extension, or set `nar.lsp.path` in settings.",
            "Open Settings",
        );
        if (choice === "Open Settings") {
            vscode.commands.executeCommand(
                "workbench.action.openSettings", "nar.lsp.path");
        }
        return;
    }

    const serverOptions: ServerOptions = {
        command: luaInterpreter,
        args: [lunarScript, ...extraArgs, "--lsp"],
        transport: TransportKind.stdio,
        options: {
            // Force stdio binary mode by running in current shell environment.
            env: process.env,
        },
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { language: "nar", scheme: "file" },
            { language: "nar", scheme: "untitled" },
        ],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher("**/*.nar"),
        },
        outputChannelName: "Nar Language Server",
    };

    client = new LanguageClient(
        "narLanguageServer",
        "Nar Language Server",
        serverOptions,
        clientOptions,
    );

    try {
        await client.start();
    } catch (err) {
        vscode.window.showErrorMessage(
            `Nar: failed to start LSP server (${String(err)}).`);
        client = undefined;
        return;
    }

    context.subscriptions.push({
        dispose: () => {
            if (client) {
                void client.stop();
            }
        },
    });
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) return undefined;
    return client.stop();
}
