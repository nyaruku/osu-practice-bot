import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Environment } from '@Bootstrap/Environment';

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
        Discord.client.once(Events.ClientReady, (readyClient) => {
            console.log(`Ready! Logged in as ${readyClient.user.tag}`);
        });
        
        console.log(`Starting Discord Bot...`);
        await Discord.client.login(Environment.env.DISCORD_BOT_TOKEN);
    }
}