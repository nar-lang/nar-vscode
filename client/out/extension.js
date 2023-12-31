"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const net = require("net");
const vscode_languageclient_1 = require("vscode-languageclient");
let client;
function activate(context) {
    let connectionInfo = {
        port: 56918,
        host: "127.0.0.1"
    };
    let serverOptions = () => {
        // Connect to language server via socket
        let socket = net.connect(connectionInfo);
        let result = {
            writer: socket,
            reader: socket
        };
        return Promise.resolve(result);
    };
    let clientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'oak' }],
        synchronize: {},
    };
    // Create the language client and start the client.
    client = new vscode_languageclient_1.LanguageClient('oakLanguageServer', 'Oak Language Server', serverOptions, clientOptions);
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
//# sourceMappingURL=extension.js.map