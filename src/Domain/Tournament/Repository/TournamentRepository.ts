import { createPool } from '@Core/Database/Connection';
import { Tournament } from '@Domain/Tournament/Model/TournamentModel';
import { Environment } from '@Bootstrap/Environment';

const pool = createPool();

export class BeatmapsetRepository {
    static async insertTournament(tournament: Tournament): Promise<void> {
        await pool.query(`
            INSERT INTO public.${Environment.env.TABLE_TOURNAMENTS} (
                id,
                name
            ) VALUES (
                $1,$2
            )
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
        `, [
            tournament.name
        ]);
    }

    // Batch insert used by Import
    static async insertTournaments(tournaments: Tournament[]): Promise<void> {
        if (tournaments.length === 0) {
            return;
        }

        const values: string[] = [];
        const parameters: string[] = [];

        tournaments.forEach((tournament, i) => {
            values.push(`($${i + 1})`);
            parameters.push(tournament.name);
        });

        await pool.query(`
            INSERT INTO public.${Environment.env.TABLE_TOURNAMENTS} (
                name
            ) VALUES
                ${values.join(',\n')}
            ON CONFLICT (name) DO NOTHING
        `, parameters);
    }

    static async getAllTournaments(): Promise<String[]> {
        const res = await pool.query(
            `SELECT name FROM public.${Environment.env.TABLE_TOURNAMENTS} ORDER BY name ASC`
        );
        return res.rows.map(r => String(r.name));
    }

}