/*
    DOMAIN MODELS
    These represent database rows.
===========================
        User
===========================
*/
export interface User {
    id: bigint;
    osu_id: bigint;
    osu_username: string;
}