import chalk from 'chalk';
import { BeatmapController } from '@Domain/Beatmap/Controller/BeatmapController';
import { BeatmapsetController } from '@Domain/Beatmapset/Controller/BeatmapsetController';
import { BaseTask } from '@Task/BaseTask';

export class BeatmapUpdater {
    static async run(interval: number, errorDelay: number): Promise<void> {
        await BaseTask.runTask(interval*60*1000, errorDelay*60*1000, this.name, async () => {
            await BeatmapController.refreshAllBeatmaps();
            await BeatmapsetController.refreshAllBeatmapsets();
            console.log(chalk.green("Completed full refresh of all Beatmaps and Sets, starting next iteration..."));
        });
    }
}