import { Schema } from '@nestjs/mongoose';
import { SchemaOptions } from 'mongoose';

/** Makes MongoDB regular expression searches case-insensitive. */
export const MONGO_REGEX_CASE_INSENSITIVE = 'i';
/** Makes ^ and $ match the start and end of each line. */
export const MONGO_REGEX_MULTILINE = 'm';
/** Ignores unescaped whitespace and allows comments in regular expressions. */
export const MONGO_REGEX_EXTENDED = 'x';
/** Allows . to match newline characters. */
export const MONGO_REGEX_DOT_ALL = 's';
/** Enables Unicode matching. */
export const MONGO_REGEX_UNICODE = 'u';

//------------------------------------------------------------------------------------------

/** Mongoose document version key. */
export const MONGO_VERSION_KEY = '__v';
/** Builds a string of fields to exclude from a Mongoose query. */
export const getExcludeFields = (...fields: string[]): string => fields.map(field => `-${field}`).join(' ');

//------------------------------------------------------------------------------------------

/** Defines shared Mongoose schema options and applies them to a collection. */
export const MONGO_DEFAULT_SCHEMA_OPTIONS: SchemaOptions = { timestamps: true, optimisticConcurrency: true };
/** Applies the shared Mongoose schema options to the specified collection. */
export const DefaultSchema = (collection: string): ClassDecorator => Schema({ ...MONGO_DEFAULT_SCHEMA_OPTIONS, collection });

//------------------------------------------------------------------------------------------

/** Checks whether a MongoDB error was caused by a unique index violation (duplicate key, code 11000).
 * This can happen in concurrent requests when both check that a value does not exist before either one is saved.
 */
export const isDuplicateKeyError = (error: unknown): error is { code: number } => (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: number }).code === 11000
);