import { Environment } from '@Bootstrap/Environment';
import { PrivateMessage } from 'bancho.js';
import { PrivateCommandRegister } from '@Bots/Irc/Commands/PrivateCommandRegister'

export async function OnPrivateMessage(message: PrivateMessage) {
    if (!message.content.startsWith(Environment.env.BOT_PREFIX))
        return;

    let args = message.content.slice(1).split(/\s+/);

    const cmd = PrivateCommandRegister.get(args[0]);
    if (!cmd) {
        message.user.sendMessage(`Command ${args[0]} not found...`);
        return;
    }

    cmd(message, args.slice(1));
}
