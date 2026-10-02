import { Verify } from '@Bots/Irc/Commands/Private/Verify';

const commands = [
    Verify
];

export const PrivateCommandRegister = new Map(commands.map((cmd) => [cmd.name.toLowerCase(), cmd]));