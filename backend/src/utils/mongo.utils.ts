// Checks whether a MongoDB error was caused by a unique index violation (duplicate key, code 11000).
// This can happen in concurrent requests when both check that a value does not exist before either one is saved.
export function isDuplicateKeyError(error: unknown): error is { code: number } {
    return (
        typeof error === 'object'
        && error !== null
        && 'code' in error
        && (error as { code?: number }).code === 11000
    );
}