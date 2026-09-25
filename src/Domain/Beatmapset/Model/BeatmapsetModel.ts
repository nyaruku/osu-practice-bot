/*
    DOMAIN MODELS
    These represent database rows.
===========================
        Beatmapset 
===========================
*/
export interface Beatmapset {
    artist: string | null;
    artist_unicode: string | null;
    creator: string | null;
    id: bigint;
    offset: number | null;
    status: string | null;
    title: string | null;
    title_unicode: string | null;
    user_id: bigint | null;
}