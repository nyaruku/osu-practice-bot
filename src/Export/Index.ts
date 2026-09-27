import fs from 'fs';
import { Environment } from '@Bootstrap/Environment';

function escapeCsv(value: string): string {
    if (value.includes('"') || value.includes(',') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

async function main(): Promise<void> {
    await Environment.initialize();

    const { createPool } = await import('@Core/Database/Connection');

    const pool = createPool();
    const result = await pool.query(`
        SELECT
            t.name AS "Tournament",
            p.round AS "Stage",
            p.slot AS "Slot",
            p.beatmap_id AS "BeatmapID"
        FROM pools p
        JOIN tournaments t ON t.id = p.tournament_id
        ORDER BY t.name, p.round, p.slot
    `);

    const csv = [
        'Tournament,Stage,Slot,BeatmapID',
        ...result.rows.map(row =>
            `${escapeCsv(row.Tournament)},${escapeCsv(row.Stage)},${escapeCsv(row.Slot)},${row.BeatmapID}`
        )
    ].join('\n');

    fs.writeFileSync(require.resolve('@Data/maps.csv'), csv);
    await pool.end();
}

main().catch((err) => {
    console.error('Fatal error:', err instanceof Error ? err.message : err);
    process.exit(1);
});