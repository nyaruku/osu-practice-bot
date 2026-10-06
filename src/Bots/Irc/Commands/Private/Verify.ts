import { PrivateMessage } from 'bancho.js';
import { Environment } from '@Bootstrap/Environment';
import { LinkCodeService } from '@Domain/User/Service/LinkCodeService';
import { UserRepository } from '@Domain/User/Repository/UserRepository';

export async function Verify(message: PrivateMessage, args: string[]) {
    if (args.length !== 1) {
        await message.user.sendMessage(`Usage: ${Environment.env.BOT_PREFIX}verify <code> (get a code with /link on Discord)`);
        return;
    }

    const discordId = LinkCodeService.consume(args[0]);
    if (discordId === null) {
        await message.user.sendMessage("Invalid or expired code. Use /link on Discord to get a new one.");
        return;
    }

    // Populates id/username from the osu! API
    await message.user.fetchFromAPI();

    await UserRepository.linkUser({
        id: discordId,
        osu_id: BigInt(message.user.id),
        osu_username: message.user.username,
    });

    console.log(`Linked discord ${discordId} to osu! ${message.user.username} (${message.user.id})`);
    await message.user.sendMessage("Your osu! account is now linked to your Discord account.");
};