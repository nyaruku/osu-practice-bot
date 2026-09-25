/*
    DOMAIN MODELS
    These represent database rows.
===========================
        Beatmap
===========================
*/
export interface Beatmap {
    id: bigint;
    beatmapset_id: bigint;

    version: string | null;
    status: string | null;

    mode: string | null;
    mode_int: number | null;

    difficulty_rating: number | null;

    cs: number | null;
    ar: number | null;
    accuracy: number | null;
    drain: number | null;
    
    max_combo: bigint | null;
    bpm: number | null;

    total_length: bigint | null;
    hit_length: bigint | null;
}