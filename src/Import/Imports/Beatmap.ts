import chalk from 'chalk';
import { BeatmapRepository } from '@Domain/Beatmap/Repository/BeatmapRepository';

export class Beatmap {
    static async Import(csvRows: string[][], BATCH_SIZE: number) {
        const beatmaps = [
            ...new Set(csvRows.map(row => row[3]))
        ].map(id => ({
            id: BigInt(id)
        }));
        console.log(chalk.cyan(`Importing Beatmaps (${beatmaps.length})...`));
        for (let i = 0; i < beatmaps.length; i += BATCH_SIZE) {
            const batch = beatmaps.slice(i, i + BATCH_SIZE);
            console.log(chalk.blue(`Importing beatmap batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} beatmaps)...`));
            await BeatmapRepository.insertBeatmaps(batch);
        }
        console.log(chalk.cyan("Beatmaps imported"));
    }
}