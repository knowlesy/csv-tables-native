import * as vscode from 'vscode';
import { CsvEditorProvider } from './csvEditorProvider';

export function activate(context: vscode.ExtensionContext) {
    // Register the custom editor provider
    const provider = new CsvEditorProvider(context);
    
    const customEditorProviderRegistration = vscode.window.registerCustomEditorProvider(
        'csvViewerNative.csvEditor',
        provider,
        {
            webviewOptions: {
                retainContextWhenHidden: true,
            },
            supportsMultipleEditorsPerDocument: false,
        }
    );

    // Register the command to open CSV as table
    const openCsvTableCommand = vscode.commands.registerCommand('csvViewerNative.openCsvTable', (uri: vscode.Uri) => {
        vscode.commands.executeCommand('vscode.openWith', uri, 'csvViewerNative.csvEditor');
    });

    context.subscriptions.push(customEditorProviderRegistration, openCsvTableCommand);
}

export function deactivate() {}
