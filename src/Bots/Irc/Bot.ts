import { Environment } from '@Bootstrap/Environment';
import { BanchoClient } from 'bancho.js';

export class Irc {
    private static BOT_PREFIX= ".";

    private static readonly client = new BanchoClient({
        username: Environment.env.IRC_USERNAME,
        password: Environment.env.IRC_PASSWORD,
        apiKey: Environment.env.OSU_API_KEY,
    });    
    static async run(): Promise<void> {
        Irc.client.connect().then(() => {
            console.log("Connected to Bancho IRC");
            Irc.client.on("PM", (message) => console.log(`${message.user.ircUsername}: ${message.message}`));
        }).catch(console.error);
    }
}