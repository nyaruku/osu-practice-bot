import { createMirrorPool } from '@Core/Database/Connection';
import { Beatmap } from '@Domain/Beatmap/Model/BeatmapModel';
import { Environment } from '@Bootstrap/Environment';

const pool = createMirrorPool();

const COLUMNS = `
    accuracy,
    ar,
    beatmapset_id,
    bpm,
    cs,
    difficulty_rating,
    drain,
    hit_length,
    id,
    max_combo,
    mode,
    mode_int,
    status,
    total_length,
    version
`;

function toBeatmap(row: any): Beatmap {
    row.id = Number(row.id);
    return row;
}

export class MirrorBeatmapRepository {
    static async getById(id: number): Promise<Beatmap | null> {
        const res = await pool.query(
            `SELECT ${COLUMNS} FROM public.${Environment.env.MIRROR_TABLE_BEATMAPS} WHERE id = $1`,
            [id]
        );
        if (res.rows.length === 0) {
            return null;
        }
        return toBeatmap(res.rows[0]);
    }

    static async getByIds(ids: number[]): Promise<Beatmap[]> {
        const res = await pool.query(
            `SELECT ${COLUMNS} FROM public.${Environment.env.MIRROR_TABLE_BEATMAPS} WHERE id = ANY($1)`,
            [ids]
        );
        const beatmaps = [];
        for (const row of res.rows) {
            beatmaps.push(toBeatmap(row));
        }
        return beatmaps;
    }
}