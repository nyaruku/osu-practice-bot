import { createPool } from '@Core/Database/Connection';
import { Environment } from '@Bootstrap/Environment';

const pool = createPool();

export class DatabaseService {
    // Returns query roundtrip in ms
    public static async ping(): Promise<number> {
        const start = Date.now();
        await pool.query('SELECT 1');
        return Date.now() - start;
    }

    public static async getSize(): Promise<number> {
        const res = await pool.query('SELECT pg_database_size(current_database()) AS size');
        return Number(res.rows[0].size);
    }

    public static async getCounts(): Promise<Record<string, number>> {
        const env = Environment.env;
        const res = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM public.${env.TABLE_BEATMAPS}) AS beatmaps,
                (SELECT COUNT(*) FROM public.${env.TABLE_BEATMAPSETS}) AS beatmapsets,
                (SELECT COUNT(*) FROM public.${env.TABLE_TOURNAMENTS}) AS tournaments,
                (SELECT COUNT(DISTINCT (tournament_id, round)) FROM public.${env.TABLE_POOLS}) AS pools,
                (SELECT COUNT(*) FROM public.${env.TABLE_USERS}) AS users
        `);
        const row = res.rows[0];
        return {
            beatmaps: Number(row.beatmaps),
            beatmapsets: Number(row.beatmapsets),
            tournaments: Number(row.tournaments),
            pools: Number(row.pools),
            users: Number(row.users),
        };
    }
}
