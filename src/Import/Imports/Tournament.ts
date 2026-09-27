import chalk from 'chalk';
import { TournamentRepository } from '@Domain/Tournament/Repository/TournamentRepository';

export class Tournament {
    static async Import(csvRows: string[][], BATCH_SIZE: number) {
        const tournaments = [
            ...new Set(csvRows.map(row => row[0]))
        ].map(name => ({
            name
        }));
        console.log(chalk.cyan(`Importing Tournaments (${tournaments.length})...`));
        for (let i = 0; i < tournaments.length; i += BATCH_SIZE) {
            const batch = tournaments.slice(i, i + BATCH_SIZE);
            console.log(chalk.blue(`Importing tournament batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} tournaments)...`));
            await TournamentRepository.insertTournaments(batch);
        }
        console.log(chalk.cyan("Tournaments imported"));
    }
}