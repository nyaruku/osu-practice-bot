import { SlashCommandBuilder } from 'discord.js';

export const Ping = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong.'),
    async execute(interaction: any) {
        await interaction.reply('pong!');
    },
};