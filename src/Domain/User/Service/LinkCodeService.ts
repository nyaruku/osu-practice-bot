import { randomInt } from 'crypto';

interface PendingLink {
    discordId: bigint;
    expiresAt: number;
}

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const CODE_TTL_MS = 10 * 60 * 1000;

export class LinkCodeService {
    private static readonly codes = new Map<string, PendingLink>();

    static get ttlMinutes(): number {
        return CODE_TTL_MS / 60000;
    }

    /**
     * Creates a new code for the given discord user, replacing any code they already had.
     */
    static create(discordId: bigint): string {
        this.purge(discordId);

        let code: string;
        do {
            code = Array.from({ length: CODE_LENGTH }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
        } while (this.codes.has(code));

        this.codes.set(code, { discordId, expiresAt: Date.now() + CODE_TTL_MS });
        return code;
    }

    /**
     * Returns the discord id the code belongs to and invalidates it, or null if invalid/expired.
     */
    static consume(code: string): bigint | null {
        this.purge();
        const key = code.toUpperCase();
        const pending = this.codes.get(key);
        if (!pending) {
            return null;
        }
        this.codes.delete(key);
        return pending.discordId;
    }

    // Removes expired codes, plus any code belonging to discordId if given
    private static purge(discordId?: bigint): void {
        const now = Date.now();
        for (const [code, pending] of this.codes) {
            if (pending.expiresAt <= now || pending.discordId === discordId) {
                this.codes.delete(code);
            }
        }
    }
}
