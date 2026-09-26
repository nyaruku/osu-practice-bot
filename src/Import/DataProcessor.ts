import { readFileSync } from "fs";

// Parse csv and return array
export class DataProcessor {
    static parseCsv(csvPath: string): string[][] {
        const csvContent: String = readFileSync(csvPath, "utf-8");
        const rows: string[][] = [];
        let row: string[] = [];
        let field = "";
        let inQuotes = false;

        for (let i = 0; i < csvContent.length; i++) {
            const char = csvContent[i];
            if (inQuotes) {
                if (char === '"') {
                    if (csvContent[i + 1] === '"') {
                        field += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    field += char;
                }
                continue;
            }
            if (char === '"') {
                inQuotes = true;
            } else if (char === ",") {
                row.push(field);
                field = "";
            } else if (char === "\n") {
                row.push(field);
                rows.push(row);
                row = [];
                field = "";
            } else {
                field += char;
            }
        }
        if (field || row.length) {
            row.push(field);
            rows.push(row);
        }
        console.log(`Transformed ${rows.length} rows from ${csvPath}`);
        return rows;
    }
}
