export const INVALID_PRICE = 'Insira um valor numérico válido e maior que zero';

/** Money is stored as integer cents: no coercion, fractional cents or overflow. */
export function priceInCents(value: unknown): number | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return;
    const scaled = value * 100;
    const cents = Math.round(scaled);
    if (!Number.isSafeInteger(cents) || cents <= 0) return;
    if (Math.abs(scaled - cents) > Number.EPSILON * Math.max(1, Math.abs(scaled)) * 2) return;
    return cents;
}
