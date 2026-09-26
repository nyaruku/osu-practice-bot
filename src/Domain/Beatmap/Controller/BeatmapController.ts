import chalk from 'chalk';
import { OsuApiService } from "@Service/OsuApiService";
import { BeatmapRepository } from "@Domain/Beatmap/Repository/BeatmapRepository";

export class BeatmapController {
    static async fetchBeatmapFromOsu(id: number): Promise<any> {
        let osuApiInstance = await OsuApiService.v2.getApiInstance();

        try {
            const getBeatmap = async () => {
                try {
                    return await osuApiInstance.getBeatmap(id);
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

            const rawBeatmap = await getBeatmap() as any;

            if (!rawBeatmap) {
                const exists = await BeatmapRepository.beatmapExists(id);
                if (exists) {
                    // TODO: DELETE FROM DATABASE
                } else {
                    // We should not be able to fall into this case
                }
                return null;
            }

            return await this.processBeatmap(rawBeatmap);
        } catch (err: any) {
            const details = err instanceof Error
                ? err.message
                : `status_code: ${err?.status_code ?? '?'} | message: ${err?.message ?? '?'} | endpoint: ${Array.isArray(err?.endpoint) ? err.endpoint.join('/') : err?.endpoint ?? '?'}`;
            console.error(chalk.red(`Failed to fetch beatmap ${id}:`), details);
            return null;
        }
    }

    static async processBeatmap(rawBeatmap: any): Promise<any> {

        // Create flatten out beatmap object
        const beatmap = {
            ...rawBeatmap
        };
        
        // Insert or update beatmapset
        await BeatmapRepository.insertBeatmap(beatmap);

        console.log(chalk.green(`Processed beatmap ${chalk.white(rawBeatmap.id)}`));
        return beatmap;
    }

    /**
    * Beatmap updater
    * Fetch and process existing beatmaps in the database
    */
    static async refreshAllBeatmaps(): Promise<void> {
        let osuApiInstance = await OsuApiService.v2.getApiInstance();

        try {
            const ids = await BeatmapRepository.getAllBeatmaps();

            for (let i = 0; i < ids.length; i += 50) {
                const batchIds = ids.slice(i, i + 50);
                
                try {
                    const concurrencyLimit = 1;
                    const beatmaps = [];
                    
                    // Process in chunks
                    for (let j = 0; j < batchIds.length; j += concurrencyLimit) {
                        const chunk = batchIds.slice(j, j + concurrencyLimit);
                        const promises = chunk.map(id => 
                            osuApiInstance.getBeatmap(id).catch((err: unknown) => {
                                console.warn(chalk.yellow(`Failed to fetch beatmap ${id}:`), err instanceof Error ? err.message : err);
                                return null;
                            })
                        );

                        const results = await Promise.all(promises);
                        beatmaps.push(...results);
                        
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                    
                    // Create a map of successfully retrieved beatmaps
                    const beatmapMap = new Map(
                        beatmaps
                            .filter(bs => bs !== null)
                            .map(bs => [bs!.id, bs!])
                    );

                    // Process each ID in order
                    for (const id of batchIds) {
                        const beatmap = beatmapMap.get(id);
                        if (beatmap) {
                            await this.processBeatmap(beatmap);

                            // !!!!! MOVE TO ENV
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }
                    }
                } catch (err) {
                    console.error(chalk.red(`Failed to process batch ${Math.floor(i / 50) + 1}:`), err instanceof Error ? err.message : err);
                }
                console.log(chalk.gray(`Processed batch ${Math.floor(i / 50) + 1}/${Math.ceil(ids.length / 50)} (IDs ${batchIds[0]}-${batchIds[batchIds.length - 1]})`));
            }
            console.log(chalk.green("Finished refreshing all beatmaps"));
        } catch (err) {
            console.error(chalk.red("Error in refreshAllBeatmaps:"), err instanceof Error ? err.message : err);
        }
    }
}