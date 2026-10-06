import { createPool } from '@Core/Database/Connection';
import { Pool, PoolSummary, PoolSort, SortOrder, PoolStars, PoolElo } from '@Domain/Pool/Model/PoolModel';
import { Environment } from '@Bootstrap/Environment';

const pool = createPool();

function toNumberOrNull(value: string | null): number | null {
    if (value === null) {
        return null;
    }
    return Number(value);
}

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
        let direction = 'ASC';
        if (order === 'desc') {
            direction = 'DESC';
        }

        const orderBys: Record<PoolSort, string> = {
            name: `t.name ${direction}, p.round ${direction}`,
            size: `maps ${direction}, t.name ASC, p.round ASC`,
            elo: `elo ${direction} NULLS LAST, t.name ASC, p.round ASC`,
        };

        const res = await pool.query(`
            SELECT t.name AS tournament, p.round, COUNT(*) AS maps, MAX(p.elo) AS elo
            FROM public.${Environment.env.TABLE_POOLS} p
            JOIN public.${Environment.env.TABLE_TOURNAMENTS} t ON t.id = p.tournament_id
            GROUP BY t.name, p.round
            ORDER BY ${orderBys[sort]}
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        return res.rows.map(r => ({
            tournament: r.tournament,
            round: r.round,
            maps: Number(r.maps),
            elo: toNumberOrNull(r.elo),
        }));
    }

    static async countPools(): Promise<number> {
        const res = await pool.query(`
            SELECT COUNT(DISTINCT (tournament_id, round)) AS count FROM public.${Environment.env.TABLE_POOLS}
        `);
        return Number(res.rows[0].count);
    }

    static async getAllPoolStars(): Promise<PoolStars[]> {
        const res = await pool.query(`
            SELECT
                p.tournament_id,
                p.round,
                AVG(b.difficulty_rating) AS avg_stars,
                MAX(b.difficulty_rating) FILTER (WHERE p.slot = 'NM1') AS nm1_stars
            FROM public.${Environment.env.TABLE_POOLS} p
            JOIN public.${Environment.env.TABLE_BEATMAPS} b ON b.id = p.beatmap_id
            GROUP BY p.tournament_id, p.round
        `);
        return res.rows.map(r => ({
            tournament_id: BigInt(r.tournament_id),
            round: r.round,
            avg_stars: toNumberOrNull(r.avg_stars),
            nm1_stars: toNumberOrNull(r.nm1_stars),
        }));
    }

    // Batch update, sets elo on every slot of each pool
    static async updatePoolElos(elos: PoolElo[]): Promise<void> {
        if (elos.length === 0) {
            return;
        }

        await pool.query(`
            UPDATE public.${Environment.env.TABLE_POOLS} p
            SET elo = e.elo
            FROM UNNEST($1::bigint[], $2::text[], $3::real[]) AS e(tournament_id, round, elo)
            WHERE p.tournament_id = e.tournament_id
            AND p.round = e.round
        `, [
            elos.map(e => e.tournament_id.toString()),
            elos.map(e => e.round),
            elos.map(e => e.elo)
        ]);
    }
}