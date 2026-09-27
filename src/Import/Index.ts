import { Environment } from '@Bootstrap/Environment';
import chalk from 'chalk';
/*
===========================
    DATA IMPORTER
    THIS WILL INSERT:
    - Beatmaps (ID)
    - Tournaments (FULL)
    - Pools (FULL)
    ADDITIONAL DATA MUST BE FILLED
    BY CORRESPONDING TASKS
===========================
*/
async function main(): Promise<void> {
    await Environment.initialize();
    
    const { Logger } = await import('@Core/Logging/Logger');
    Logger.hookConsole();
    console.log(chalk.redBright(`[ DATA IMPORTER ]`));
    
    const { SchemaUpdater } = await import('@Core/Database/SchemaUpdater');
    await SchemaUpdater.initialize();
    
    const { CsvTransformer } = await import('@Import/CsvTransformer');
    let csvRows = CsvTransformer.parseCsv(require.resolve('@Data/maps.csv'));

    if (csvRows.length == 0) {
        console.log(chalk.yellowBright("Zero CSV Rows were returned."));
        console.log(chalk.redBright("Canceling Import."));
        return;
    }

    // Remove Column Header
    csvRows = csvRows.slice(1);
    const BATCH_SIZE = 2000;
    console.log(chalk.yellowBright(`Import Batch Size: ${BATCH_SIZE}`));

    const { Tournament } = await import('@Import/Imports/Tournament');
    const { Pool } = await import('@Import/Imports/Pool');
    const { Beatmap } = await import('@Import/Imports/Beatmap');

    await Tournament.Import(csvRows, BATCH_SIZE);
    await Beatmap.Import(csvRows, BATCH_SIZE);

    if (!Pool.Check(csvRows)) {
        // Abort pool import if duplicate inserts found
        process.exit(0);
    }
    await Pool.Import(csvRows, BATCH_SIZE);

    console.log("DataImporter finished.");
}

main().catch((err) => {
    console.error('Fatal error:', err instanceof Error ? err.message : err);
    process.exit(1);
});
