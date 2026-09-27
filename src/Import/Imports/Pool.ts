import chalk from 'chalk';
import { TournamentRepository } from '@Domain/Tournament/Repository/TournamentRepository';
import { PoolRepository } from '@Domain/Pool/Repository/PoolRepository';

export class Pool {
    static Check(csvRows: string[][]): boolean {
        const poolKeys = new Set<string>();
        const duplicatePools = new Set<string>();

        csvRows.forEach(row => {
            const key = `${row[0]}|${row[1]}|${row[2]}`;
            if (poolKeys.has(key)) {
                duplicatePools.add(key);
            }
            poolKeys.add(key);
        });

        if (duplicatePools.size > 0) {
            console.log(chalk.red(`Found ${duplicatePools.size} duplicate pools.`));
            duplicatePools.forEach(pool => {
                console.log(chalk.yellow(pool));
            });
            console.log(chalk.red("Canceling Import."));
            return false;
        }

        console.log(chalk.green("No duplicate pools found."));
        return true;
    }

    static async Import(csvRows: string[][], BATCH_SIZE: number) {
        const tournamentIds = await TournamentRepository.getAllTournamentIds();
        const pools = csvRows.map(row => ({
            tournament_id: tournamentIds.get(row[0])!,
            round: row[1],
            slot: row[2],
            beatmap_id: BigInt(row[3])
        }));
        console.log(chalk.cyan(`Importing Pools (${pools.length})...`));
        for (let i = 0; i < pools.length; i += BATCH_SIZE) {
            const batch = pools.slice(i, i + BATCH_SIZE);
            console.log(`Importing pool batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} pools)...`);
            await PoolRepository.insertPools(batch);
        }
        console.log(chalk.cyan("Pools imported"));
    }
}