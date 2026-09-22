import { describe, expect, it } from 'vitest';

import { ClienteSchema } from './cliente.schema.js';

describe('ClienteSchema', () => {
    it('usa a coleção de clientes com os campos esperados', () => {
        expect(ClienteSchema.options.collection).toBe('clientes');
        expect(ClienteSchema.options.timestamps).toBe(true);
        expect(Object.keys(ClienteSchema.paths)).toEqual(expect.arrayContaining([
            'cpf',
            'email',
            'nomeCompleto',
            'telefone',
            'endereco',
        ]));
    });

    it('mantém CPF e e-mail como índices únicos', () => {
        const indexes = ClienteSchema.indexes();

        expect(indexes).toEqual(expect.arrayContaining([
            [{ cpf: 1 }, { unique: true }],
            [{ email: 1 }, { unique: true }],
        ]));
    });
});
