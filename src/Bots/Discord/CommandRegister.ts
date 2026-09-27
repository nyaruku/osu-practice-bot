import { Command } from '@Bots/Discord/Command';

export class CommandRegister {
    private static readonly commands: Command[] = [];
    static register(command: Command): void {
        CommandRegister.commands.push(command);
    }
    static all(): readonly Command[] {
        return CommandRegister.commands;
    }
}