import { Ping } from '@Bots/Discord/Commands/Ping';
import { Link } from '@Bots/Discord/Commands/Link';
import { Status } from '@Bots/Discord/Commands/Status';

const commands = [
    Ping
    ,Link
    ,Status
];

export const CommandRegister = new Map(commands.map((cmd) => [cmd.data.name, cmd]));
