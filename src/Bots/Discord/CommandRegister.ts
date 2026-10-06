import { Ping } from '@Bots/Discord/Commands/Ping';
import { Link } from '@Bots/Discord/Commands/Link';

const commands = [
    Ping
    ,Link
];

export const CommandRegister = new Map(commands.map((cmd) => [cmd.data.name, cmd]));
