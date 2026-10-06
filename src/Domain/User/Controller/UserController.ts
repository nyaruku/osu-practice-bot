import chalk from 'chalk';
import { OsuApiService } from '@Service/OsuApiService';
import { UserRepository } from '@Domain/User/Repository/UserRepository';
import { Environment } from '@Bootstrap/Environment';

export class UserController {
    /**
     * Links the owner's discord and osu! accounts from the env, skipping verification.
     * Does nothing if OWNER_DISCORD_ID or OWNER_OSU_ID is not set.
     */
    static async linkOwner(): Promise<void> {
        const discordId = Environment.env.OWNER_DISCORD_ID;
        const osuId = Environment.env.OWNER_OSU_ID;
        if (!discordId || !osuId) {
            return;
        }

        try {
            const osuApiInstance = await OsuApiService.v2.getApiInstance();
            const osuUser = await osuApiInstance.getUser(Number(osuId));

            await UserRepository.linkUser({
                id: BigInt(discordId),
                osu_id: BigInt(osuId),
                osu_username: osuUser.username,
            });
            console.log(chalk.green(`Linked owner discord ${discordId} to osu! ${osuUser.username} (${osuId})`));
        } catch (err) {
            console.error(chalk.red("Failed to link owner account:"), err instanceof Error ? err.message : err);
        }
    }
}