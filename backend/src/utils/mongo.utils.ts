import { Schema } from '@nestjs/mongoose';
import { SchemaOptions } from 'mongoose';

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