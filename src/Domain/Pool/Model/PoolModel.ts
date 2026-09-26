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