import { Ping } from '@Bots/Discord/Commands/Ping';
import { Link } from '@Bots/Discord/Commands/Link';
import { Status } from '@Bots/Discord/Commands/Status';
import { Mappools } from '@Bots/Discord/Commands/Mappools';

const commands = [
    Ping
    ,Link
    ,Status
    ,Mappools
];

export const CommandRegister = new Map(commands.map((cmd) => [cmd.data.name, cmd]));