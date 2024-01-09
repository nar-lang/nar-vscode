"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
const path = require("node:path");
let client;
function activate(context) {
    let executable = context.asAbsolutePath(getExecutableName());
    //let serverOptions = () => {
    // Connect to language server via socket
    // let socket = net.connect({
    //         port: 56918,
    //         host: "127.0.0.1"
    //     });
    // let result: StreamInfo = {
    //     writer: socket,
    //     reader: socket
    // };
    // return Promise.resolve(result);
    //};
    let serverOptions = {
        run: { transport: vscode_languageclient_1.TransportKind.stdio, command: executable, args: ["-lsp=stdio"] },
        debug: { transport: vscode_languageclient_1.TransportKind.stdio, command: executable, args: ["-lsp=stdio"] },
    };
    let clientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: '' }],
        synchronize: {},
        outputChannelName: "Nar Language Server",
    };
    // Create the language client and start the client.
    client = new vscode_languageclient_1.LanguageClient('LanguageServer', 'Nar Language Server', serverOptions, clientOptions);
    // Start the client. This will also launch the server
    client.start();
}
exports.activate = activate;
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
function getExecutableName() {
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
//# sourceMappingURL=extension.js.map