import { SlashCommandBuilder } from 'discord.js';
import { Command } from '@Bots/Discord/Command';

export const Ping: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong to check that the bot is alive.'),
    async execute(interaction) {
        await interaction.reply('pong!');
    },
};