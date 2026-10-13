import { createMirrorPool } from '@Core/Database/Connection';
import { Beatmapset } from '@Domain/Beatmapset/Model/BeatmapsetModel';
import { Environment } from '@Bootstrap/Environment';

const pool = createMirrorPool();

const COLUMNS = `
    artist,
    artist_unicode,
    creator,
    id,
    "offset",
    status,
    title,
    title_unicode,
    user_id
`;

// pg gives BIGINT back as a string, refresh looks maps up by number
function toBeatmapset(row: any): Beatmapset {
    row.id = Number(row.id);
    return row;
}

// Mirror database is shared, only ever SELECT here
export class MirrorBeatmapsetRepository {
    static async getById(id: number): Promise<Beatmapset | null> {
        const res = await pool.query(
            `SELECT ${COLUMNS} FROM public.${Environment.env.MIRROR_TABLE_BEATMAPSETS} WHERE id = $1`,
            [id]
        );
        if (res.rows.length === 0) {
            return null;
        }
        return toBeatmapset(res.rows[0]);
    }

    static async getByIds(ids: number[]): Promise<Beatmapset[]> {
        const res = await pool.query(
            `SELECT ${COLUMNS} FROM public.${Environment.env.MIRROR_TABLE_BEATMAPSETS} WHERE id = ANY($1)`,
            [ids]
        );
        const beatmapsets = [];
        for (const row of res.rows) {
            beatmapsets.push(toBeatmapset(row));
        }
        return beatmapsets;
    }
}