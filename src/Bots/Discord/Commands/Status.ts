import os from 'os';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { DatabaseService } from '@Service/DatabaseService';
import { Irc } from '@Bots/Irc/Bot';

function toMB(bytes: number): string {
    return (bytes / 1024 / 1024).toFixed(0) + 'MB';
}

function toHours(seconds: number): string {
    return (seconds / 3600).toFixed(1) + 'h';
}

export const Status = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Bot, database and server status.'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        let database: string;
        try {
            const ping = await DatabaseService.ping();
            const size = await DatabaseService.getSize();
            const counts = await DatabaseService.getCounts();
            database =
                `online, ${ping}ms, ${toMB(size)}\n` +
                `Beatmaps: ${counts.beatmaps}\n` +
                `Beatmapsets: ${counts.beatmapsets}\n` +
                `Tournaments: ${counts.tournaments}\n` +
                `Pools: ${counts.pools}\n` +
                `Users: ${counts.users}`;
        } catch (err) {
            database = 'offline';
        }

        await interaction.editReply(
            '```ps\n' +
            `Bot\n` +
            `Uptime: ${toHours(process.uptime())}\n` +
            `Discord: ${interaction.client.ws.ping}ms\n` +
            `IRC: ${Irc.isConnected() ? 'connected' : 'disconnected'}\n` +
            `Memory: ${toMB(process.memoryUsage().rss)}\n` +
            `\n` +
            `Database\n` +
            `${database}\n` +
            `\n` +
            `Server\n` +
            `Uptime: ${toHours(os.uptime())}\n` +
            `Memory: ${toMB(os.totalmem() - os.freemem())} / ${toMB(os.totalmem())}\n` +
            `Node: ${process.version}\n` +
            '```'
        );
    },
};
