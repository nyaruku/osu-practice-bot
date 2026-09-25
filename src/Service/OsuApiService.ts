import chalk from 'chalk';
import * as osu from 'osu-api-v2-js';
import { Environment } from '@Bootstrap/Environment';

export class OsuApiService {

    static v2 = class {
        /**
         * Do not use this, use getApiInstance() instead
        */
        public static osuApiInstance: osu.API | null = null;

        public static async authenticate(): Promise<void> {
            try {
                console.log(chalk.cyan("Authenticating with osu! API..."));
                const api = await osu.API.createAsync(
                    parseInt(Environment.env.OSU_API_CLIENT_ID!, 10),
                    Environment.env.OSU_API_CLIENT_SECRET!
                );
                // Wrap with a Proxy so every method call is counted
                this.osuApiInstance = new Proxy(api, {
                    get(target, prop) {
                        const value = (target as any)[prop];
                        if (typeof value === 'function') {
                            return function (...args: any[]) {
                                // ApiCallLogService.logV2();
                                return value.apply(target, args);
                            };
                        }
                        return value;
                    }
                });
                console.log(chalk.green("osu! API authenticated successfully"));
            } catch (err) {
                console.error(chalk.red("Failed to authenticate osu! API:"), err instanceof Error ? err.message : err);
                throw err;
            }
        }
        public static async getApiInstance(): Promise<osu.API> {
            while (!this.osuApiInstance) {
                await this.authenticate();
                if (!this.osuApiInstance) {
                    console.log(chalk.yellow("Could not authenticate to the osu! Api."));
                    console.log(chalk.yellow("Retrying osu! API authentication in 5 seconds..."));
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                }
            }
            return this.osuApiInstance!;
        }
    }
}