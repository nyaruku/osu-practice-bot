import { createPool } from '@Core/Database/Connection';
import { Beatmap } from '@Domain/Beatmap/Model/BeatmapModel';
import { Environment } from '@Bootstrap/Environment';

const pool = createPool();

export class BeatmapRepository {
    static async insertBeatmap(beatmap: Beatmap): Promise<void> {
        await pool.query(`
            INSERT INTO public.${Environment.env.TABLE_BEATMAPS} (
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
            ) VALUES (
                $1,$2,$3,$4,$5,
                $6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15
            )
            ON CONFLICT (id) DO UPDATE SET
                accuracy = EXCLUDED.accuracy,
                ar = EXCLUDED.ar,
                beatmapset_id = EXCLUDED.beatmapset_id,
                bpm = EXCLUDED.bpm,
                cs = EXCLUDED.cs,
                difficulty_rating = EXCLUDED.difficulty_rating,
                drain = EXCLUDED.drain,
                hit_length = EXCLUDED.hit_length,
                max_combo = EXCLUDED.max_combo,
                mode = EXCLUDED.mode,
                mode_int = EXCLUDED.mode_int,
                status = EXCLUDED.status,
                total_length = EXCLUDED.total_length,
                version = EXCLUDED.version
        `, [
            beatmap.accuracy,
            beatmap.ar,
            beatmap.beatmapset_id,
            beatmap.bpm,
            beatmap.cs,
            beatmap.difficulty_rating,
            beatmap.drain,
            beatmap.hit_length,
            beatmap.id,
            beatmap.max_combo,
            beatmap.mode,
            beatmap.mode_int,
            beatmap.status,
            beatmap.total_length,
            beatmap.version
        ]);
    }

    static async beatmapExists(id: number): Promise<boolean> {
        const res = await pool.query(
            `SELECT 1 FROM public.${Environment.env.TABLE_BEATMAPS} WHERE id = $1 LIMIT 1`,
            [id]
        );
        return res.rowCount === 1;
    }

    static async getAllBeatmaps(): Promise<number[]> {
        const res = await pool.query(
            `SELECT id FROM public.${Environment.env.TABLE_BEATMAPS} ORDER BY id ASC`
        );
        // return as number
        return res.rows.map(r => Number(r.id));
    }
}