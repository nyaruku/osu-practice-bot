import { BanchoClient } from 'bancho.js';
import { Environment } from '@Bootstrap/Environment';
import * as EventRegister from '@Bots/Irc/EventRegister';

export class Irc {
    private static readonly client = new BanchoClient({
        username: Environment.env.IRC_USERNAME,
        password: Environment.env.IRC_PASSWORD,
        apiKey: Environment.env.OSU_API_KEY,
    });

    static isConnected(): boolean {
        return Irc.client.isConnected();
    }

    static async run(): Promise<void> {
        Irc.client.connect().then(() => {
            console.log("Connected to Bancho IRC");

            // Event Listeners
            Irc.client.on("PM", (message) => EventRegister.OnPrivateMessage(message));
        }).catch(console.error);
    }
}