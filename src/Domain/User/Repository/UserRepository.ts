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
                username = EXCLUDED.osu_username
        `, [
            user.id,
            user.osu_id,
            user.osu_username
        ]);
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