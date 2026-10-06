import { createPool } from '@Core/Database/Connection';
import { Pool, PoolSummary, PoolSort, SortOrder } from '@Domain/Pool/Model/PoolModel';
import { Environment } from '@Bootstrap/Environment';

const pool = createPool();

export class PoolRepository {
    static async insertPool(poolData: Pool): Promise<void> {
        await pool.query(`
            INSERT INTO public.${Environment.env.TABLE_POOLS} (
                tournament_id,
                round,
                slot,
                beatmap_id
            ) VALUES (
                $1,$2,$3,$4
            )
            ON CONFLICT (tournament_id, round, slot) DO UPDATE SET
                beatmap_id = EXCLUDED.beatmap_id
        `, [
            poolData.tournament_id,
            poolData.round,
            poolData.slot,
            poolData.beatmap_id
        ]);
    }

    // Batch insert used by Import
    static async insertPools(pools: Pool[]): Promise<void> {
        if (pools.length === 0) {
            return;
        }

        const values: string[] = [];
        const parameters: string[] = [];

        pools.forEach((poolData, i) => {
            const offset = i * 4;
            values.push(`($${offset + 1},$${offset + 2},$${offset + 3},$${offset + 4})`);
            parameters.push(
                poolData.tournament_id.toString(),
                poolData.round,
                poolData.slot,
                poolData.beatmap_id.toString()
            );

        });

        await pool.query(`
            INSERT INTO public.${Environment.env.TABLE_POOLS} (
                tournament_id,
                round,
                slot,
                beatmap_id
            ) VALUES
                ${values.join(',\n')}
            ON CONFLICT (tournament_id, round, slot) DO UPDATE SET
                beatmap_id = EXCLUDED.beatmap_id
        `, parameters);
    }

    static async getPoolSummaries(limit: number, offset: number, sort: PoolSort, order: SortOrder): Promise<PoolSummary[]> {
        const direction = order === 'desc' ? 'DESC' : 'ASC';
        const orderBy = sort === 'size'
            ? `maps ${direction}, t.name ASC, p.round ASC`
            : `t.name ${direction}, p.round ${direction}`;

        const res = await pool.query(`
            SELECT t.name AS tournament, p.round, COUNT(*) AS maps
            FROM public.${Environment.env.TABLE_POOLS} p
            JOIN public.${Environment.env.TABLE_TOURNAMENTS} t ON t.id = p.tournament_id
            GROUP BY t.name, p.round
            ORDER BY ${orderBy}
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        return res.rows.map(r => ({
            tournament: r.tournament,
            round: r.round,
            maps: Number(r.maps),
        }));
    }

    static async countPools(): Promise<number> {
        const res = await pool.query(`
            SELECT COUNT(DISTINCT (tournament_id, round)) AS count FROM public.${Environment.env.TABLE_POOLS}
        `);
        return Number(res.rows[0].count);
    }
}