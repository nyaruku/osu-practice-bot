// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Environment } from '@Bootstrap/Environment';

export class Bot {
    private static readonly client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
        ],
    });
    
    static async run(): Promise<void> {
        Bot.client.once(Events.ClientReady, (readyClient) => {
            console.log(`Ready! Logged in as ${readyClient.user.tag}`);
        });
        
        console.log(`Starting Discord Bot...`);
        await Bot.client.login(Environment.env.DISCORD_BOT_TOKEN);
    }
}