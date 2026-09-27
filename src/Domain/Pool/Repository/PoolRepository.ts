import { createPool } from '@Core/Database/Connection';
import { Pool } from '@Domain/Pool/Model/PoolModel';
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
}