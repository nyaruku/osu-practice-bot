import chalk from 'chalk';
import { BeatmapController } from '@Domain/Beatmap/Controller/BeatmapController';
import { BaseTask } from '@Task/BaseTask';

export class BeatmapsetUpdater {
    static async run(interval: number, errorDelay: number): Promise<void> {
        await BaseTask.runTask(interval*60*1000, errorDelay*60*1000, this.name, async () => {
            await BeatmapController.refreshAllBeatmapsFromOsu();
            console.log(chalk.green("Completed full refresh. Starting next iteration..."));
        });
    }
}