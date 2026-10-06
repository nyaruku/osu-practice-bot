import { createPool } from '@Core/Database/Connection';
import { User } from '@Domain/User/Model/UserModel';
import { Environment } from '@Bootstrap/Environment';

const pool = createPool();

export class UserRepository {
    static async insertUser(user: User): Promise<void> {
        await pool.query(`
            INSERT INTO public.${Environment.env.TABLE_USERS} (
                id,
                osu_id,
                osu_username
            ) VALUES (
                $1,$2,$3
            )
            ON CONFLICT (id) DO UPDATE SET
                osu_id = EXCLUDED.osu_id,
                osu_username = EXCLUDED.osu_username
        `, [
            user.id,
            user.osu_id,
            user.osu_username
        ]);
    }

    /**
     * Links a discord account to an osu! account.
     * Any other discord account previously linked to the same osu! account is unlinked.
     */
    static async linkUser(user: User): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                `DELETE FROM public.${Environment.env.TABLE_USERS} WHERE osu_id = $1 AND id <> $2`,
                [user.osu_id, user.id]
            );
            await client.query(`
                INSERT INTO public.${Environment.env.TABLE_USERS} (
                    id,
                    osu_id,
                    osu_username
                ) VALUES (
                    $1,$2,$3
                )
                ON CONFLICT (id) DO UPDATE SET
                    osu_id = EXCLUDED.osu_id,
                    osu_username = EXCLUDED.osu_username
            `, [
                user.id,
                user.osu_id,
                user.osu_username
            ]);
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    static async userExists(id: number): Promise<boolean> {
        const res = await pool.query(
            `SELECT 1 FROM public.${Environment.env.TABLE_USERS} WHERE id = $1 LIMIT 1`,
            [id]
        );
        return res.rowCount === 1;
    }

    static async getUserByDiscordId(id: bigint): Promise<User | null> {
        const res = await pool.query(
            `SELECT * FROM public.${Environment.env.TABLE_USERS} WHERE id = $1`,
            [id]
        );
        return res.rows[0] ?? null;
    }

    static async getUserByOsuId(id: bigint): Promise<User | null> {
        const res = await pool.query(
            `SELECT * FROM public.${Environment.env.TABLE_USERS} WHERE osu_id = $1`,
            [id]
        );
        return res.rows[0] ?? null;
    }
}