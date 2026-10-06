import { Environment } from '@Bootstrap/Environment';

/*
    THIS FILE DEFINES THE DATABASE STRUCTURE
    MODIFY THIS FILE TO ADD TABLES OR COLUMNS
*/

interface PrimaryKey {
    table: string;
    column: string;
}

interface ForeignKey {
    sourceTable: string;
    sourceColumn: string;
    targetTable: string;
    targetColumn: string;
    onDelete: string;
    constraintName: string;
}

interface CompositePrimaryKey {
    table: string;
    columns: string[];
}

export class Schema {
    static primaryKeys: PrimaryKey[] = [
        { table: Environment.env.TABLE_BEATMAPS!, column: 'id' },
        { table: Environment.env.TABLE_BEATMAPSETS!, column: 'id' },
        { table: Environment.env.TABLE_USERS!, column: 'id' },
        { table: Environment.env.TABLE_TOURNAMENTS!, column: 'id' },
    ];

    static compositePrimaryKeys: CompositePrimaryKey[] = [
        {
            table: Environment.env.TABLE_POOLS!,
            columns: [
                'tournament_id',
                'round',
                'slot'
            ]
        }
    ];

    static foreignKeys: ForeignKey[] = [
        {
            sourceTable: Environment.env.TABLE_POOLS!,
            sourceColumn: 'tournament_id',
            targetTable: Environment.env.TABLE_TOURNAMENTS!,
            targetColumn: 'id',
            onDelete: 'CASCADE',
            constraintName: 'fk_pool_tournament_id',
        },
        {
            sourceTable: Environment.env.TABLE_POOLS!,
            sourceColumn: 'beatmap_id',
            targetTable: Environment.env.TABLE_BEATMAPS!,
            targetColumn: 'id',
            onDelete: 'CASCADE',
            constraintName: 'fk_pool_beatmap_id',
        },
    ];

    static Indexes: string[] = [
        `CREATE INDEX IF NOT EXISTS idx_${Environment.env.TABLE_BEATMAPS}_beatmapset_id ON public.${Environment.env.TABLE_BEATMAPS} (beatmapset_id);`,
        `CREATE INDEX IF NOT EXISTS idx_${Environment.env.TABLE_POOLS}_beatmap_id ON public.${Environment.env.TABLE_POOLS} (beatmap_id);`,
        `CREATE INDEX IF NOT EXISTS idx_${Environment.env.TABLE_POOLS}_tournament_id ON public.${Environment.env.TABLE_POOLS} (tournament_id);`,
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_${Environment.env.TABLE_USERS}_osu_id ON public.${Environment.env.TABLE_USERS} (osu_id);`,
        `CREATE EXTENSION IF NOT EXISTS pg_trgm;`,
        `CREATE INDEX IF NOT EXISTS idx_${Environment.env.TABLE_BEATMAPSETS}_title_trgm ON public.${Environment.env.TABLE_BEATMAPSETS} USING gin (title gin_trgm_ops);`,
        `CREATE INDEX IF NOT EXISTS idx_${Environment.env.TABLE_BEATMAPSETS}_artist_trgm ON public.${Environment.env.TABLE_BEATMAPSETS} USING gin (artist gin_trgm_ops);`,
        `CREATE INDEX IF NOT EXISTS idx_${Environment.env.TABLE_BEATMAPSETS}_creator_trgm ON public.${Environment.env.TABLE_BEATMAPSETS} USING gin (creator gin_trgm_ops);`
    ];

    static Tables = {
        beatmaps: `
            CREATE TABLE IF NOT EXISTS public.${Environment.env.TABLE_BEATMAPS} (
                "id" BIGINT NOT NULL PRIMARY KEY,
                "beatmapset_id" BIGINT NULL DEFAULT NULL,
                "version" TEXT NULL DEFAULT NULL,
                "status" TEXT NULL DEFAULT NULL,
                "mode" TEXT NULL DEFAULT NULL,
                "mode_int" SMALLINT NULL DEFAULT NULL,
                "difficulty_rating" REAL NULL DEFAULT NULL,
                "cs" REAL NULL DEFAULT NULL,
                "ar" REAL NULL DEFAULT NULL,
                "accuracy" REAL NULL DEFAULT NULL,
                "drain" REAL NULL DEFAULT NULL,
                "max_combo" BIGINT NULL DEFAULT NULL,
                "bpm" REAL NULL DEFAULT NULL,
                "total_length" BIGINT NULL DEFAULT NULL,
                "hit_length" BIGINT NULL DEFAULT NULL
            );
            ALTER TABLE public.${Environment.env.TABLE_BEATMAPS} OWNER TO ${Environment.env.PG_USERNAME};
        `,

        beatmapsets: `
            CREATE TABLE IF NOT EXISTS public.${Environment.env.TABLE_BEATMAPSETS} (
                "id" BIGINT NOT NULL PRIMARY KEY,
                "artist" TEXT NULL DEFAULT NULL,
                "artist_unicode" TEXT NULL DEFAULT NULL,
                "creator" VARCHAR(30) NULL DEFAULT NULL,
                "offset" INTEGER NULL DEFAULT NULL,
                "status" TEXT NULL DEFAULT NULL,
                "title" TEXT NULL DEFAULT NULL,
                "title_unicode" TEXT NULL DEFAULT NULL,
                "user_id" BIGINT NULL DEFAULT NULL
            );
            ALTER TABLE public.${Environment.env.TABLE_BEATMAPSETS} OWNER TO ${Environment.env.PG_USERNAME};
        `,

        users: `
            CREATE TABLE IF NOT EXISTS public.${Environment.env.TABLE_USERS} (
                "id" BIGINT NOT NULL PRIMARY KEY,
                "osu_id" BIGINT NOT NULL,
                "osu_username" VARCHAR(30) NOT NULL
            );
            ALTER TABLE public.${Environment.env.TABLE_USERS} OWNER TO ${Environment.env.PG_USERNAME};
        `,

        tournaments: `
            CREATE TABLE IF NOT EXISTS public.${Environment.env.TABLE_TOURNAMENTS} (
                "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                "name" TEXT NOT NULL UNIQUE
            );
            ALTER TABLE public.${Environment.env.TABLE_TOURNAMENTS} OWNER TO ${Environment.env.PG_USERNAME};
        `,

        pools: `
            CREATE TABLE IF NOT EXISTS public.${Environment.env.TABLE_POOLS} (
                "tournament_id" BIGINT NOT NULL,
                "round" TEXT NOT NULL,
                "slot" TEXT NOT NULL,
                "beatmap_id" BIGINT NOT NULL,
                "elo" REAL NULL DEFAULT NULL,
                PRIMARY KEY ("tournament_id", "round", "slot")
            );
            ALTER TABLE public.${Environment.env.TABLE_POOLS} OWNER TO ${Environment.env.PG_USERNAME};
        `,
    };
}