import {ExtensionContext} from "vscode";
import {LanguageClient, LanguageClientOptions, ServerOptions, StreamInfo, TransportKind} from "vscode-languageclient";
import * as path from "node:path";
import * as vscode from "vscode";
import * as net from "net";

let client: LanguageClient;


export function activate(context: ExtensionContext) {
    let executable = context.asAbsolutePath(getExecutableName());

    let serverOptions: ServerOptions = {
        transport: TransportKind.stdio, command: executable, args: ["-lsp=stdio"]
    }

    if (true) {
        serverOptions = () => {
            // Connect to language server via socket
            let socket = net.connect({
                port: 56918,
                host: "127.0.0.1"
            });
            let result: StreamInfo = {
                writer: socket,
                reader: socket
            };
            return Promise.resolve(result);
        };
    }

    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{scheme: 'file', language: ''}],
        synchronize: {},
        outputChannelName: "Nar Language Server",
    };

    // Create the language client and start the client.
    client = new LanguageClient(
        'LanguageServer',
        'Nar Language Server',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

function getExecutableName(): string {
    let platform = "";
    let ext = "";
    switch (process.platform) {
        case "win32":
            platform = "windows";
            ext = ".exe";
            break;
        case "linux":
            platform = "linux";
            break;
        case "darwin":
            platform = "darwin";
            break;
        default:
            throw new Error("Unsupported platform: " + process.platform);
    }
    let arch = "";
    switch (process.arch) {
        case "arm":
            arch = "arm";
            break;
        case "arm64":
            arch = "arm64";
            break;
        case "x32":
            arch = "386";
            break;
        case "x64":
            arch = "amd64";
            break;
        default:
            throw new Error("Unsupported architecture: " + process.arch);
    }
    return path.join("bin", `nar-${platform}-${arch}${ext}`);
}
