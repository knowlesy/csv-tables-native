# CSV Table Viewer Extension

[![Build Status](https://github.com/knowlesy/csv-table-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/knowlesy/csv-table-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code Marketplace](https://img.shields.io/badge/VS_Marketplace-Extension-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=knowlesy.csv-viewer-native)

A Visual Studio Code extension that displays CSV files in a beautiful, interactive table format.

## Features

- **Table View**: Display CSV files in a clean, readable table format
- **Search**: Filter table rows by searching for specific text
- **Word Wrap**: Toggle word wrapping for better readability of long content
- **Copy to Clipboard**: Export the filtered table data to your clipboard
- **Hover Effects**: Row highlighting for better navigation
- **Empty Cell Handling**: Clearly indicates empty cells
- **Responsive Design**: Adapts to VS Code themes and window sizing

## Usage

1. Install the extension
2. Open any CSV file in VS Code
3. Right-click on the CSV file in the explorer and select "Open as Table"
4. Or use the command palette (Ctrl/Cmd + Shift + P) and search for "CSV: Open as Table"

## Features in Detail

### Interactive Table
- Sticky header row for easy column reference while scrolling
- Row striping for better readability
- Hover effects to highlight current row

### Search Functionality
- Type in the search box to filter rows containing your search term
- Case-insensitive search across all columns
- Live filtering as you type

### Toolbar Actions
- **Copy Table**: Copies the currently visible (filtered) table data to clipboard in CSV format
- **Toggle Word Wrap**: Switch between wrapped and non-wrapped text in cells

### Theme Integration
- Automatically adapts to your current VS Code theme
- Uses native VS Code color variables for consistent appearance

## File Support

Currently supports basic CSV files with:
- Comma-separated values
- Simple quoted fields
- Empty cells
- Standard line endings

## Development

To work on this extension:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the TypeScript
4. Press F5 to open a new Extension Development Host window
5. Test the extension with CSV files

## Known Limitations

- Basic CSV parsing (doesn't handle all edge cases like nested quotes)
- Large files (>10MB) may impact performance
- No editing capabilities (view-only)

## Security

This extension is built with modern security best practices in mind:
- **Strict Content Security Policy (CSP)**: The webview is heavily locked down to prevent unauthorized scripts, styles, or resources from loading.
- **XSS Prevention**: CSV data is never directly injected into HTML. It is safely passed to the frontend via the VS Code `postMessage` API and parsed internally, eliminating Cross-Site Scripting (XSS) risks.
- **Dependency Minimization**: The extension uses a lightweight dependency tree and is bundled using `esbuild` to reduce the attack surface.

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration:
- **Every push to main** triggers an automated build and test pipeline.
- **Type Checking & Tests**: The TypeScript code is compiled and the internal CSV parser is rigorously tested using `vitest` (100% test coverage).
- **Automated VSIX Packaging**: A production-ready `.vsix` extension file is automatically packaged by the pipeline on every successful run.

## License

This extension is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Feel free to submit issues and enhancement requests!

Please follow the commit message format above for automatic versioning.

## Author

Created by Co-Pilot - requested by PK 
