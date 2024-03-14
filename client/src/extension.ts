import * as lc from "vscode-languageclient/node";
import * as vscode from "vscode";
import * as net from "net";
import * as os from "os";

let client: lc.LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    const outputChannelName = "Nar Language Server";

    let executable = vscode.workspace.getConfiguration("nar").get("pathToCompiler", "nar");
    if (executable.startsWith("~/")) {
        executable = os.homedir() + executable.slice(1);
    }
    const transport = vscode.workspace.getConfiguration("nar").get<string>("transport", "stdio");
    const port = vscode.workspace.getConfiguration("nar").get("tcpPort", 56918);
    const cache = vscode.workspace.getConfiguration("nar").get("cacheDir", "~/.nar/packages");

    let serverOptions;
    switch (transport) {
        case "stdio":
            serverOptions = {
                transport: lc.TransportKind.stdio,
                command: executable, args: ["-lsp", `-cache="${cache}"`]
            };
            break;
        case "tcp":
            serverOptions = () => {
                let socket = net.connect({port: port, host: "127.0.0.1"});
                let result: lc.StreamInfo = {writer: socket, reader: socket};
                return Promise.resolve(result);
            };
            break;
    }

    let clientOptions: lc.LanguageClientOptions = {
        documentSelector: [{scheme: "file", language: "nar"}],
        synchronize: {},
        outputChannelName: outputChannelName,
    };
    client = new lc.LanguageClient(
        "LanguageServer",
        "Nar Language Server",
        serverOptions,
        clientOptions
    );
    client.start();

}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
