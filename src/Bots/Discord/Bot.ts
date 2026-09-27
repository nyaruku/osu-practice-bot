import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Environment } from '@Bootstrap/Environment';
import { CommandRegister } from '@Bots/Discord/CommandRegister';
import { CommandHandler } from '@Bots/Discord/CommandHandler';

export class Discord {
    private static readonly client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
        ],
    });

    static async run(): Promise<void> {
        Discord.client.once(Events.ClientReady, async (readyClient) => {
            console.log(`Ready! Logged in as ${readyClient.user.tag}`);
            await readyClient.application.commands.set(
                CommandRegister.all().map((cmd) => cmd.data)
            );
            console.log(`Registered ${CommandRegister.all().length} slash command(s).`);
        });

        Discord.client.on(Events.InteractionCreate, (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            CommandHandler.handle(interaction).catch((err) =>
                console.error('Failed to handle interaction:', err instanceof Error ? err.message : err)
            );
        });

        console.log(`Starting Discord Bot...`);
        await Discord.client.login(Environment.env.DISCORD_BOT_TOKEN);
    }
}