import chalk from 'chalk';
import { PoolRepository } from '@Domain/Pool/Repository/PoolRepository';
import { PoolElo } from '@Domain/Pool/Model/PoolModel';

export class PoolController {
    // Stolen from RomAI
    static calculateElo(avgStars: number, nm1Stars: number): number {
        return (avgStars * 0.7 + nm1Stars * 0.3) * 250;
    }

    static async refreshAllPoolElos(): Promise<void> {
        const pools = await PoolRepository.getAllPoolStars();

        const elos: PoolElo[] = [];
        let skipped = 0;

        for (const p of pools) {
            // Pools without an NM1 or without star ratings get no elo
            let elo = null;
            if (p.avg_stars !== null && p.nm1_stars !== null) {
                elo = this.calculateElo(p.avg_stars, p.nm1_stars);
            } else {
                skipped++;
            }

            elos.push({
                tournament_id: p.tournament_id,
                round: p.round,
                elo: elo,
            });
        }

        await PoolRepository.updatePoolElos(elos);

        console.log(chalk.green(`Calculated ELO for ${elos.length - skipped} pools`));
        if (skipped > 0) {
            console.log(chalk.yellow(`Skipped ${skipped} pools, missing NM1 or star ratings`));
        }
    }
}