import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder, inlineCode } from 'discord.js';
import { Environment } from '@Bootstrap/Environment';
import { LinkCodeService } from '@Domain/User/Service/LinkCodeService';
import { UserRepository } from '@Domain/User/Repository/UserRepository';

export const Link = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your osu! account to your Discord account.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const discordId = BigInt(interaction.user.id);
        const existing = await UserRepository.getUserByDiscordId(discordId);
        const code = LinkCodeService.create(discordId);

        const command = `${Environment.env.BOT_PREFIX}verify ${code}`;

        if (existing) {
            await interaction.reply({
                content: `You are already linked to ${inlineCode(existing.osu_username)}\n` + 
                `To link a different account, send: ${inlineCode(command)} to ${inlineCode(Environment.env.IRC_USERNAME)} in osu!.\n` +
                `The code expires in ${LinkCodeService.ttlMinutes} minutes.`,
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: `Send ${command} to ${Environment.env.IRC_USERNAME} in osu! to link your account.\n` + 
                `The code expires in ${LinkCodeService.ttlMinutes} minutes.`,
                flags: MessageFlags.Ephemeral,
            });
        }
        return;
    },
};
