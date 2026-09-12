/** Escapes special characters before using a value in a regular expression. */
export const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Removes all non-numeric characters from a string. */
export const onlyDigits = (value: string): string => value.replace(/\D/g, '');