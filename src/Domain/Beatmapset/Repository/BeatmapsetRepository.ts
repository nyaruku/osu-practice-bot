import { createPool } from '@Core/Database/Connection';
import { Beatmapset } from '@Domain/Beatmapset/Model/BeatmapsetModel';
import { Environment } from '@Bootstrap/Environment';

const pool = createPool();

export class BeatmapsetRepository {
    static async insertBeatmapset(beatmapset: Beatmapset): Promise<void> {
        await pool.query(`
            INSERT INTO public.${Environment.env.TABLE_BEATMAPSETS} (
                artist,
                artist_unicode,
                creator,
                id,
                "offset",
                status,
                title,
                title_unicode,
                user_id
            ) VALUES (
                $1,$2,$3,$4,$5,
                $6,$7,$8,$9
            )
            ON CONFLICT (id) DO UPDATE SET
                artist = EXCLUDED.artist,
                artist_unicode = EXCLUDED.artist_unicode,
                creator = EXCLUDED.creator,
                "offset" = EXCLUDED."offset",
                status = EXCLUDED.status,
                title = EXCLUDED.title,
                title_unicode = EXCLUDED.title_unicode,
                user_id = EXCLUDED.user_id
        `, [
            beatmapset.artist,
            beatmapset.artist_unicode,
            beatmapset.creator,
            beatmapset.id,
            beatmapset.offset,
            beatmapset.status,
            beatmapset.title,
            beatmapset.title_unicode,
            beatmapset.user_id
        ]);
    }

    static async beatmapsetExists(id: number): Promise<boolean> {
        const res = await pool.query(
            `SELECT 1 FROM public.${Environment.env.TABLE_BEATMAPSETS} WHERE id = $1 LIMIT 1`,
            [id]
        );
        return res.rowCount === 1;
    }

    static async getBeatmapsetById(id: bigint): Promise<Beatmapset | null> {
        const res = await pool.query(
            `SELECT * FROM public.${Environment.env.TABLE_BEATMAPSETS} WHERE id = $1`,
            [id]
        );
        return res.rows[0] ?? null;
    }

    static async getAllBeatmapsets(): Promise<number[]> {
        const res = await pool.query(
            `SELECT id FROM public.${Environment.env.TABLE_BEATMAPSETS} ORDER BY id ASC`
        );
        // return as number
        return res.rows.map(r => Number(r.id));
    }

}