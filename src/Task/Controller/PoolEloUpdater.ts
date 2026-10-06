import chalk from 'chalk';
import { PoolController } from '@Domain/Pool/Controller/PoolController';
import { BaseTask } from '@Task/BaseTask';

export class PoolEloUpdater {
    static async run(interval: number, errorDelay: number): Promise<void> {
        await BaseTask.runTask(interval*60*1000, errorDelay*60*1000, this.name, async () => {
            await PoolController.refreshAllPoolElos();
            console.log(chalk.green("Completed Pool ELO update, starting next iteration..."));
        });
    }
}