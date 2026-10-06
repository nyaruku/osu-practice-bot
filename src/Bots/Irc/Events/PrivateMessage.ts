import { Environment } from '@Bootstrap/Environment';
import { PrivateMessage } from 'bancho.js';
import { PrivateCommandRegister } from '@Bots/Irc/Commands/PrivateCommandRegister'

export async function OnPrivateMessage(message: PrivateMessage) {
    if (!message.content.startsWith(Environment.env.BOT_PREFIX))
        return;

    let args = message.content.slice(1).split(/\s+/);

    const cmd = PrivateCommandRegister.get(args[0].toLowerCase());
    if (!cmd) {
        message.user.sendMessage(`Command ${args[0]} not found...`);
        return;
    }

    cmd(message, args.slice(1)).catch((err) => {
        console.error(`IRC command "${args[0]}" failed:`, err instanceof Error ? err.message : err);
        message.user.sendMessage("Something went wrong running that command.").catch(() => {});
    });
}
