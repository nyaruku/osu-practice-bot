/*
    DOMAIN MODELS
    These represent database rows.
===========================
        Pool
===========================
*/
export interface Pool {
    tournament_id: bigint;
    round: string;
    slot: string;
    beatmap_id: bigint;
}

export interface PoolSummary {
    tournament: string;
    round: string;
    maps: number;
}

export type PoolSort = 'name' | 'size';
export type SortOrder = 'asc' | 'desc';