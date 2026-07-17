export function parseCsv(text: string): string[][] {
    if (!text) {
        return [];
    }

    text = text.trim();
    if (!text) return [];

    const result: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            if (inQuotes && i + 1 < text.length && text[i + 1] === '"') {
                // Escaped quotes ""
                currentField += '"';
                i++; // skip the next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField.trim());
            currentField = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
                i++;
            }
            currentRow.push(currentField.trim());
            result.push(currentRow);
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }

    // Add the final field and row
    currentRow.push(currentField.trim());
    result.push(currentRow);

    return result;
}
