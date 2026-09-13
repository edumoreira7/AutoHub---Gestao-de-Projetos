import { Schema, Prop, PropOptions } from '@nestjs/mongoose';
import { SchemaOptions } from 'mongoose';

/** Defines shared Mongoose schema options and applies them to a collection. */
export const MONGO_DEFAULT_SCHEMA_OPTIONS: SchemaOptions = { timestamps: true, optimisticConcurrency: true };
/** Applies the shared Mongoose schema options to the specified collection. */
export const DefaultSchema = (collection: string): ClassDecorator => Schema({ ...MONGO_DEFAULT_SCHEMA_OPTIONS, collection });

//------------------------------------------------------------------------------------------

// Decorator utilities for associating Mongoose model fields with human-readable
// display names, retrievable later without repeating the mapping elsewhere.
// 
// Examples:
// class Cliente {
//   @Field('CPF', { required: true })
//   cpf: string;
// }
//
// const ClienteFields = fieldsOf(Cliente);
// ClienteFields.cpf; // "CPF"

/** Class constructor for a generic given type. */
type Constructor<T = any> = new (...args: any[]) => T;
/** Stores display names for each model class without preventing garbage collection. */
const fieldNames = new WeakMap<Constructor, Record<string, string>>();

/** Creates a Mongoose property and associates it with a display name. */
export const Field = (displayName: string, options?: PropOptions) => (target: object, propertyKey: string) => {
    Prop(options)(target, propertyKey);

    const ctor = target.constructor as Constructor;
    const map = fieldNames.get(ctor) ?? {};
    map[propertyKey] = displayName;
    fieldNames.set(ctor, map);
};

/** Returns the mapped display names for all fields of a model. */
export const fieldsOf = <T>(model: Constructor<T>): Record<keyof T, string> =>
    (fieldNames.get(model) as Record<keyof T, string>) ?? ({} as Record<keyof T, string>);

//------------------------------------------------------------------------------------------

/**
 * Returns the name of the field that caused a MongoDB unique index violation or `undefined` if the error was not caused by one.
 * This can happen in concurrent requests when both check that a value does not exist before either one is saved.
 */
export const duplicateKeyOf = (error: unknown): string | undefined => {
    if (typeof error !== 'object' || error === null || !('code' in error)) return undefined;
    if ((error as { code?: number }).code !== 11000) return undefined;

    const keyPattern = (error as { keyPattern?: Record<string, unknown> }).keyPattern;
    return keyPattern ? Object.keys(keyPattern)[0] : undefined;
};