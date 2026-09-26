// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Environment } from '@Bootstrap/Environment';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

export async function run() {
    client.once(Events.ClientReady, (readyClient) => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    });
    
    console.log(`Starting Discord Bot...`);
    await client.login(Environment.env.DISCORD_BOT_TOKEN);
}