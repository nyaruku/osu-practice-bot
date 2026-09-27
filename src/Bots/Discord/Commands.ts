import { CommandRegister } from '@Bots/Discord/CommandRegister';
import { Ping } from '@Bots/Discord/Cmds/Ping';

export function registerCommands(): void {
    CommandRegister.register(Ping);
}