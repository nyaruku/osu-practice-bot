import chalk from 'chalk';
import { BeatmapUpdater } from '@Task/Controller/BeatmapUpdater';
import { OsuAuthenticator } from '@Task/Controller/OsuAuthenticator';

export class TaskRunner {
    static async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    
    static async run(): Promise<void> {
        try {
            OsuAuthenticator.run(120, 1);

            // Make sure API is ready
            await this.sleep(15000);

            BeatmapUpdater.run(1, 30);
        } catch (err) {
            console.error(chalk.red("TaskRunner encountered an error:"), err instanceof Error ? err.message : err);
            process.exit(1);
        }
    }
}