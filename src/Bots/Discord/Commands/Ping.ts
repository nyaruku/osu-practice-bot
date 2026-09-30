import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const Ping = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong.'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Pinging...');
        const sent = await interaction.fetchReply();
        const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;

        await interaction.editReply(
            `
            Pong!
            Bot: ${roundtrip}ms
            WebSocket: ${interaction.client.ws.ping}ms
            `
        );
    },
};