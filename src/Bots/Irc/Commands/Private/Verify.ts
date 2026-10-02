import { PrivateMessage } from 'bancho.js';

export async function Verify(message: PrivateMessage, args: string[]) {
    if (args.length !== 1 || !Number.isInteger(Number(args[0]))) {
        message.user.sendMessage("Invalid command usage...");
        return;
    }
    message.user.sendMessage("args[0] => " + args[0]);
    return;
};