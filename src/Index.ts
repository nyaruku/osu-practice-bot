import { Environment } from '@Bootstrap/Environment';

async function main(): Promise<void> {
    await Environment.initialize();
    
    const { Logger } = await import('@Core/Logging/Logger');
    const { SchemaUpdater } = await import('@Core/Database/SchemaUpdater');
    const { Discord } = await import('@Bots/Discord/Bot');
    const { Irc } = await import('@Bots/Irc/Bot');
    const { TaskRunner } = await import('@Task/TaskRunner');

    Logger.hookConsole();
    console.log(`[ osu-practice-bot ]`);
    await SchemaUpdater.initialize();
    await Discord.run();
    await Irc.run();
    TaskRunner.run();
    console.log("main() execution done.");
}

main().catch((err) => {
    console.error('Fatal error:', err instanceof Error ? err.message : err);
    process.exit(1);
});
