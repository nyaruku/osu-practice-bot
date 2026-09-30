import { ChatInputCommandInteraction } from 'discord.js';
import { CommandRegister } from '@Bots/Discord/CommandRegister';

export class CommandHandler {
    static async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const command = CommandRegister.get(interaction.commandName);
        if (!command) {
            return;
        }
        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(`Command "${interaction.commandName}" failed:`, err instanceof Error ? err.message : err);
            const errorReply = {
                content: 'Something went wrong running that command.',
                ephemeral: true
            };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorReply);
            } else {
                await interaction.reply(errorReply);
            }
        }
    }
}