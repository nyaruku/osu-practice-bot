export class NekohaApiService {
    // Use this baseUrl if u fork
    // private static readonly baseUrl = "https://mirror.nekoha.moe";
    private static readonly baseUrl = "http://mirror-server:30727";

    // We probably can avoid calling official osu! Api

    public static async getBeatmapset(beatmapsetId: number): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/beatmapset/${beatmapsetId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch beatmapset ${beatmapsetId}: HTTP ${response.status}`);
        }
        return response.json();
    }

    public static async getBeatmap(beatmapId: number): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/beatmap/${beatmapId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch beatmap ${beatmapId}: HTTP ${response.status}`);
        }
        return response.json();
    }
}