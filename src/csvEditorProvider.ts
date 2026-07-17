import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { parseCsv } from './utils/csvParser';

export class CsvEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new CsvEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            CsvEditorProvider.viewType,
            provider
        );
        return providerRegistration;
    }

    private static readonly viewType = 'csvTablesNative.csvEditor';

    constructor(private readonly context: vscode.ExtensionContext) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document);

        function updateWebview() {
            const parsedArray = parseCsv(document.getText());
            webviewPanel.webview.postMessage({
                type: 'update',
                data: parsedArray,
            });
        }

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'edit':
                    this.updateTextDocument(document, e.text);
                    return;
            }
        });

        updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CSV Table Viewer</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: 20px;
                }
                
                .container {
                    max-width: 100%;
                    overflow-x: auto;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    background-color: var(--vscode-editor-background);
                }
                
                th, td {
                    border: 1px solid var(--vscode-panel-border);
                    padding: 8px 12px;
                    text-align: left;
                    white-space: nowrap;
                }
                
                th {
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    font-weight: bold;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                
                tr:nth-child(even) {
                    background-color: var(--vscode-editor-lineHighlightBackground);
                }
                
                tr:hover {
                    background-color: var(--vscode-list-hoverBackground);
                }
                
                .info {
                    margin-bottom: 10px;
                    font-size: 0.9em;
                    color: var(--vscode-descriptionForeground);
                }
                
                .empty-cell {
                    color: var(--vscode-descriptionForeground);
                    font-style: italic;
                }
                
                .toolbar {
                    margin-bottom: 20px;
                    padding: 10px;
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    border-radius: 4px;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 0.9em;
                }
                
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .search-input {
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    padding: 6px 8px;
                    border-radius: 3px;
                    font-size: 0.9em;
                }
            </style>
        </head>
        <body>
            <div class="toolbar">
                <span>CSV Table Viewer</span>
                <input type="text" class="search-input" id="searchInput" placeholder="Search in table..." />
                <button onclick="exportToClipboard()">Copy Table</button>
                <button onclick="toggleWordWrap()">Toggle Word Wrap</button>
            </div>
            
            <div class="info" id="info">Loading...</div>
            
            <div class="container">
                <table id="csvTable">
                    <thead id="tableHead"></thead>
                    <tbody id="tableBody"></tbody>
                </table>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                let csvData = [];
                let filteredData = [];
                let wordWrapEnabled = false;

                // Listen for messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'update':
                            csvData = message.data;
                            filteredData = [...csvData];
                            renderTable();
                            break;
                    }
                });

                function renderTable() {
                    const table = document.getElementById('csvTable');
                    const thead = document.getElementById('tableHead');
                    const tbody = document.getElementById('tableBody');
                    const info = document.getElementById('info');
                    
                    if (filteredData.length === 0) {
                        info.textContent = 'No data to display';
                        thead.innerHTML = '';
                        tbody.innerHTML = '';
                        return;
                    }

                    // Update info
                    const totalRows = csvData.length - 1; // Excluding header
                    const filteredRows = filteredData.length - 1;
                    const columns = csvData[0] ? csvData[0].length : 0;
                    
                    if (filteredRows !== totalRows) {
                        info.textContent = \`Showing \${filteredRows} of \${totalRows} rows, \${columns} columns\`;
                    } else {
                        info.textContent = \`\${totalRows} rows, \${columns} columns\`;
                    }

                    // Render header
                    thead.innerHTML = '';
                    if (filteredData.length > 0) {
                        const headerRow = document.createElement('tr');
                        filteredData[0].forEach(header => {
                            const th = document.createElement('th');
                            th.textContent = header || '(Empty)';
                            headerRow.appendChild(th);
                        });
                        thead.appendChild(headerRow);
                    }

                    // Render body
                    tbody.innerHTML = '';
                    for (let i = 1; i < filteredData.length; i++) {
                        const row = document.createElement('tr');
                        filteredData[i].forEach(cell => {
                            const td = document.createElement('td');
                            if (cell === '' || cell === undefined || cell === null) {
                                td.innerHTML = '<span class="empty-cell">(empty)</span>';
                            } else {
                                td.textContent = cell;
                            }
                            
                            if (wordWrapEnabled) {
                                td.style.whiteSpace = 'normal';
                                td.style.wordBreak = 'break-word';
                            } else {
                                td.style.whiteSpace = 'nowrap';
                                td.style.wordBreak = 'normal';
                            }
                            
                            row.appendChild(td);
                        });
                        tbody.appendChild(row);
                    }
                }

                function searchTable() {
                    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
                    
                    if (!searchTerm) {
                        filteredData = [...csvData];
                    } else {
                        filteredData = [csvData[0]]; // Keep header
                        for (let i = 1; i < csvData.length; i++) {
                            const row = csvData[i];
                            if (row.some(cell => cell.toLowerCase().includes(searchTerm))) {
                                filteredData.push(row);
                            }
                        }
                    }
                    
                    renderTable();
                }

                function exportToClipboard() {
                    const table = document.getElementById('csvTable');
                    let csvContent = '';
                    
                    // Get header
                    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
                    csvContent += headers.join(',') + '\\n';
                    
                    // Get data rows
                    const rows = Array.from(table.querySelectorAll('tbody tr'));
                    rows.forEach(row => {
                        const cells = Array.from(row.querySelectorAll('td')).map(td => {
                            let text = td.textContent;
                            if (text === '(empty)') text = '';
                            return text.includes(',') ? \`"\${text}"\` : text;
                        });
                        csvContent += cells.join(',') + '\\n';
                    });
                    
                    navigator.clipboard.writeText(csvContent).then(() => {
                        // Could show a notification here
                        console.log('Table copied to clipboard');
                    });
                }

                function toggleWordWrap() {
                    wordWrapEnabled = !wordWrapEnabled;
                    renderTable();
                }

                // Search functionality
                document.getElementById('searchInput').addEventListener('input', searchTable);
            </script>
        </body>
        </html>`;
    }

    private updateTextDocument(document: vscode.TextDocument, text: string) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            text
        );
        return vscode.workspace.applyEdit(edit);
    }
}
