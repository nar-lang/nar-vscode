import * as net from 'net';
import { ExtensionContext, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient';

let client: LanguageClient;


export function activate(context: ExtensionContext) {
	let connectionInfo = {
		port: 56918,
		host: "127.0.0.1"
	};

	let serverOptions = () => {
		// Connect to language server via socket
		let socket = net.connect(connectionInfo);
		let result: StreamInfo = {
			writer: socket,
			reader: socket
		};
		return Promise.resolve(result);
	};

	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'oak' }],
		synchronize: {},
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'oakLanguageServer',
		'Oak Language Server',
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
