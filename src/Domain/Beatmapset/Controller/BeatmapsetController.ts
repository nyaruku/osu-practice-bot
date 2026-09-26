import chalk from 'chalk';
import { OsuApiService } from "@Service/OsuApiService";
import { BeatmapsetRepository } from "@Domain/Beatmapset/Repository/BeatmapsetRepository";

export class BeatmapsetController {
    static async fetchBeatmapsetFromOsu(id: number): Promise<any> {
        let osuApiInstance = await OsuApiService.v2.getApiInstance();

        try {
            const getBeatmapset = async () => {
                try {
                    return await osuApiInstance.getBeatmapset(id);
                } catch (err: any) {
                    if (err?.status_code === 404 || err?.message === 'Not Found' || (err instanceof Error && err.message.includes('Not Found'))) {
                        return null;
                    }
                    if (err?.status_code === 429 || (err instanceof Error && err.message.includes('rate limit'))) {
                        console.log(chalk.yellow(`Rate limit hit when fetching beatmapset ${id}, waiting 60 seconds...`));
                        await new Promise(resolve => setTimeout(resolve, 60000));
                        return await osuApiInstance.getBeatmapset(id);
                    }
                    throw err;
                }
            };

            const rawBeatmapset = await getBeatmapset() as any;

            if (!rawBeatmapset) {
                const exists = await BeatmapsetRepository.beatmapsetExists(id);
                if (exists) {
                    // We probably can just keep those in the database,
                    // beatmaps are cleaned up in BeatmapController anyway
                } else {
                    // We should not be able to fall into this case
                }
                return null;
            }
            return await this.processBeatmapset(rawBeatmapset);
        } catch (err: any) {
            const details = err instanceof Error
                ? err.message
                : `status_code: ${err?.status_code ?? '?'} | message: ${err?.message ?? '?'} | endpoint: ${Array.isArray(err?.endpoint) ? err.endpoint.join('/') : err?.endpoint ?? '?'}`;
            console.error(chalk.red(`Failed to fetch beatmapset ${id}:`), details);
            return null;
        }
    }

    /**
    * Beatmapset processer
    */
    static async processBeatmapset(rawBeatmapset: any): Promise<any> {
        // Create flatten out beatmapset object
        const beatmapset = {
            ...rawBeatmapset,
        };
        
        // Insert or update beatmapset
        await BeatmapsetRepository.insertBeatmapset(beatmapset);

        await BeatmapsetRepository.insertBeatmapset(beatmapset);
        console.log(chalk.green(`Processed beatmapset ${chalk.white(rawBeatmapset.id)} (${chalk.white(beatmapset.title)} - ${chalk.white(beatmapset.artist)})`));
        return beatmapset;
    }

    /**
    * Beatmap updater
    * Fetch and process existing beatmapsets in the database
    */
    static async refreshAllBeatmapsets(): Promise<void> {
        let osuApiInstance = await OsuApiService.v2.getApiInstance();

        try {
            // Get only beatmapsets worth re-checking (qualified, pending/wip, downloaded=false, or recently updated)
            const ids = await BeatmapsetRepository.getAllBeatmapsets();

            console.log(chalk.cyan(`Refreshing ${ids.length} beatmapsets from osu! API`));

            // Process in batches of 50 (osu! API's maximum batch size)
            for (let i = 0; i < ids.length; i += 50) {
                const batchIds = ids.slice(i, i + 50);
                
                try {
                    const concurrencyLimit = 1;
                    const beatmapsets = [];
                    
                    // Process in chunks
                    for (let j = 0; j < batchIds.length; j += concurrencyLimit) {
                        const chunk = batchIds.slice(j, j + concurrencyLimit);
                        const promises = chunk.map(id => 
                            osuApiInstance.getBeatmapset(id)
                                .catch((err: unknown) => {
                                    console.warn(chalk.yellow(`Failed to fetch beatmapset ${id}:`), err instanceof Error ? err.message : err);
                                    return null;
                                })
                        );

                        const results = await Promise.all(promises);
                        beatmapsets.push(...results);
                        
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                    
                    // Create a map of successfully retrieved beatmapsets
                    const beatmapsetMap = new Map(
                        beatmapsets
                            .filter(bs => bs !== null)
                            .map(bs => [bs!.id, bs!])
                    );

                    // Process each ID in order
                    for (const id of batchIds) {
                        const beatmapset = beatmapsetMap.get(id);
                        if (beatmapset) {
                            await this.processBeatmapset(beatmapset);

                            // !!!!! MOVE TO ENV
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }
                    }
                } catch (err) {
                    console.error(chalk.red(`Failed to process batch ${Math.floor(i / 50) + 1}:`), err instanceof Error ? err.message : err);
                }
                console.log(chalk.gray(`Processed batch ${Math.floor(i / 50) + 1}/${Math.ceil(ids.length / 50)} (IDs ${batchIds[0]}-${batchIds[batchIds.length - 1]})`));
            }
            console.log(chalk.green("Finished refreshing all beatmapsets"));
        } catch (err) {
            console.error(chalk.red("Error in refreshAllBeatmapsets:"), err instanceof Error ? err.message : err);
        }
    }
}