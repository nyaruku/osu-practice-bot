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
    elo?: number | null;
}

export interface PoolSummary {
    tournament: string;
    round: string;
    maps: number;
    elo: number | null;
}

export type PoolSort = 'name' | 'size' | 'elo';
export type SortOrder = 'asc' | 'desc';

export interface PoolStars {
    tournament_id: bigint;
    round: string;
    avg_stars: number | null;
    nm1_stars: number | null;
}

export interface PoolElo {
    tournament_id: bigint;
    round: string;
    elo: number | null;
}