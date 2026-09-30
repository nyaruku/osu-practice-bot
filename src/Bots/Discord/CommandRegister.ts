import { Ping } from '@Bots/Discord/Commands/Ping';

const commands = [
    Ping
];

export const CommandRegister = new Map(commands.map((cmd) => [cmd.data.name, cmd]));