import { Injectable } from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type LocalCollection = 'clientes' | 'veiculos' | 'ordens-servico';

export interface ClienteRecord {
    _id: string;
    cpf: string;
    email: string;
    nomeCompleto: string;
    telefone: string;
    endereco?: string;
}

export interface VeiculoRecord {
    _id: string;
    placa: string;
    marca: string;
    modelo: string;
    ano: number;
    cor: string;
    clienteId: string;
}

export interface OrdemServicoRecord {
    _id: string;
    descricao: string;
    data: string;
    veiculoId: string;
}

@Injectable()
export class LocalDataService {
    private readonly dataDirectory = process.env.DATA_DIR
        ? resolve(process.env.DATA_DIR)
        : resolve(dirname(fileURLToPath(import.meta.url)), '../../data');
    private readonly pending = new Map<LocalCollection, Promise<void>>();

    createId(): string {
        return randomBytes(12).toString('hex');
    }

    async read<T>(collection: LocalCollection): Promise<T[]> {
        return this.serialize(collection, () => this.readFile<T>(collection));
    }

    async update<T, R>(
        collection: LocalCollection,
        change: (records: T[]) => R | Promise<R>,
    ): Promise<R> {
        return this.serialize(collection, async () => {
            const records = await this.readFile<T>(collection);
            const result = await change(records);
            const path = this.collectionPath(collection);
            const temporaryPath = `${path}.${randomUUID()}.tmp`;

            await writeFile(temporaryPath, JSON.stringify(records, null, 2), 'utf8');
            await rename(temporaryPath, path);

            return result;
        });
    }

    private async serialize<T>(collection: LocalCollection, operation: () => Promise<T>): Promise<T> {
        const previous = this.pending.get(collection) ?? Promise.resolve();
        const current = previous.catch(() => undefined).then(operation);
        this.pending.set(collection, current.then(() => undefined, () => undefined));
        return current;
    }

    private async readFile<T>(collection: LocalCollection): Promise<T[]> {
        await mkdir(this.dataDirectory, { recursive: true });
        try {
            const contents = await readFile(this.collectionPath(collection), 'utf8');
            if (!contents.trim()) return [];
            const records: unknown = JSON.parse(contents);
            if (!Array.isArray(records)) throw new Error(`Arquivo ${collection}.json deve conter uma lista.`);
            return records as T[];
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    private collectionPath(collection: LocalCollection): string {
        return resolve(this.dataDirectory, `${collection}.json`);
    }
}