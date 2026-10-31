import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import type { INestApplication } from '@nestjs/common';
import type { Connection } from 'mongoose';
import { Types } from 'mongoose';
import request from 'supertest';

describe('Regressão completa + HU08/HU09 (HTTP e MongoDB real isolado)', () => {
    let mongo: MongoMemoryServer;
    let app: INestApplication;
    let connection: Connection;
    let ordemId: string;
    let servicoId: string;
    let veiculoId: string;
    const unknownId = () => new Types.ObjectId().toString();
    const api = () => request(app.getHttpServer());

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        process.env.MONGO_URI = mongo.getUri();
        process.env.MONGO_DB_NAME = 'autohub_sprint2_test';
        // Import compiled sources to retain TypeScript decorator metadata used by Nest.
        const { AppModule } = await import('../dist/app.module.js');
        const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = module.createNestApplication();
        await app.init();
        connection = app.get(getConnectionToken());
    }, 120000);
    afterAll(async () => { await app?.close(); await mongo?.stop(); });

    it('cadastra/consulta cliente, impede CPF repetido e inválido', async () => {
        const cliente = { nomeCompleto: 'Cliente Teste', cpf: '52998224725', email: 'teste@example.com', telefone: '11999990001' };
        const result = await api().post('/clientes').send(cliente).expect(201);
        expect(result.body.success).toBe(true);
        await api().post('/clientes').send(cliente).expect(409);
        await api().post('/clientes').send({ ...cliente, cpf: '11111111111', email: 'outro@example.com' }).expect(400);
        const encontrados = await api().get('/clientes').query({ nome: 'Cliente Teste' }).expect(200);
        expect(encontrados.body.data).toHaveLength(1);
        expect(encontrados.body.data[0]._id).toBe(result.body.id);
    });
    it('cadastra/consulta veículo e rejeita proprietário inexistente', async () => {
        const clientes = (await api().get('/clientes')).body.data;
        const dto = { placa: 'ABC1D23', marca: 'Fiat', modelo: 'Uno', ano: 2020, cor: 'Prata', clienteId: clientes[0]._id };
        const resposta = await api().post('/veiculos').send(dto).expect(201);
        veiculoId = resposta.body.id;
        await api().post('/veiculos').send({ ...dto, placa: 'XYZ1D23', clienteId: unknownId() }).expect(404);
        const lista = await api().get('/veiculos').query({ placa: 'ABC1D23' }).expect(200);
        expect(lista.body.data[0].cliente).toContain('Cliente Teste');
    });
    it('cria ordem vinculada ao veículo e impede ordem inválida', async () => {
        const dto = { descricao: 'Revisão completa', data: '2026-10-31', veiculoId };
        const resposta = await api().post('/ordens-servico').send(dto).expect(201);
        ordemId = resposta.body.id;
        await api().post('/ordens-servico').send({ ...dto, veiculoId: unknownId() }).expect(404);
        await api().post('/ordens-servico').send({ ...dto, data: '2026-02-30' }).expect(400);
        const lista = await api().get('/ordens-servico').expect(200);
        expect(lista.body.data[0]).toMatchObject({ totalCentavos: 0, servicos: [] });
    });
    it.each([0, -50, 'abc', '50', null, undefined, true, {}, 0.001, 10.123])('HU08 rejeita preço %j sem salvar', async precoPadrao => {
        const antes = await connection.collection('servicos').countDocuments();
        const result = await api().post('/servicos').send({ nome: 'Inválido', precoPadrao }).expect(400);
        expect(result.body.message).toBe('Insira um valor numérico válido e maior que zero');
        expect(await connection.collection('servicos').countDocuments()).toBe(antes);
    });
    it('HU08 valida nome e ativo', async () => {
        for (const nome of ['', '   ', 123, 'x'.repeat(101)]) await api().post('/servicos').send({ nome, precoPadrao: 50 }).expect(400);
        await api().post('/servicos').send({ nome: 'Revisão', precoPadrao: 50, ativo: 'false' }).expect(400);
    });
    it('HU08 salva dados reais normalizados e lista serviço ativo', async () => {
        const result = await api().post('/servicos').send({ nome: ' Troca de óleo ', precoPadrao: 100.29 }).expect(201);
        servicoId = result.body.id;
        const salvo = await connection.collection('servicos').findOne({ _id: new Types.ObjectId(servicoId) });
        expect(salvo).toMatchObject({ nome: 'Troca de óleo', precoPadrao: 100.29, ativo: true });
        const lista = await api().get('/servicos').expect(200);
        expect(lista.body.data.some((item: { _id: string }) => item._id === servicoId)).toBe(true);
    });
    it('HU09 associa e calcula pelo preço do banco, ignorando preço/total adulterados', async () => {
        const result = await api().post(`/ordens-servico/${ordemId}/servicos`).send({ servicoId, precoPadrao: 0.01, totalCentavos: -100 }).expect(201);
        expect(result.body.data).toMatchObject({ totalCentavos: 10029, total: 100.29 });
        expect(result.body.data.servicos[0]).toMatchObject({ servicoId, nome: 'Troca de óleo', precoCentavos: 10029 });
        const salvo = await connection.collection('ordens_servico').findOne({ _id: new Types.ObjectId(ordemId) });
        expect(salvo?.totalCentavos).toBe(10029);
        expect(salvo?.servicos).toHaveLength(1);
    });
    it('HU09 rejeita serviço inexistente, identificador inválido e corpo vazio sem alterar total', async () => {
        for (const dto of [{ servicoId: unknownId() }, { servicoId: 'inexistente' }, {}, { servicoId: { $ne: null } }]) {
            const result = await api().post(`/ordens-servico/${ordemId}/servicos`).send(dto).expect(400);
            expect(result.body.message).toBe('Serviço não encontrado no sistema');
        }
        const salvo = await connection.collection('ordens_servico').findOne({ _id: new Types.ObjectId(ordemId) });
        expect(salvo?.totalCentavos).toBe(10029);
    });
    it('HU09 rejeita serviço inativo e não o oferece na lista', async () => {
        const criado = await api().post('/servicos').send({ nome: 'Inativo', precoPadrao: 20, ativo: false }).expect(201);
        const result = await api().post(`/ordens-servico/${ordemId}/servicos`).send({ servicoId: criado.body.id }).expect(400);
        expect(result.body.message).toContain('inativo');
        const lista = await api().get('/servicos');
        expect(lista.body.data.some((item: { _id: string }) => item._id === criado.body.id)).toBe(false);
    });
    it('HU09 impede duplicidade, ordem ausente e identificador de ordem inválido', async () => {
        await api().post(`/ordens-servico/${ordemId}/servicos`).send({ servicoId }).expect(409);
        await api().post(`/ordens-servico/${unknownId()}/servicos`).send({ servicoId }).expect(404);
        await api().post('/ordens-servico/invalido/servicos').send({ servicoId }).expect(400);
    });
    it('HU09 mantém preço histórico após mudança de preço no catálogo', async () => {
        await connection.collection('servicos').updateOne({ _id: new Types.ObjectId(servicoId) }, { $set: { precoPadrao: 200 } });
        const lista = await api().get('/ordens-servico').query({ veiculoId }).expect(200);
        expect(lista.body.data[0].servicos[0].precoCentavos).toBe(10029);
        expect(lista.body.data[0].totalCentavos).toBe(10029);
    });
    it('HU09 soma inclusões simultâneas com exatidão e sem perder itens', async () => {
        const ids: string[] = [];
        for (let i = 0; i < 10; i++) ids.push((await api().post('/servicos').send({ nome: `Concorrente ${i}`, precoPadrao: i % 2 ? 0.2 : 0.1 }).expect(201)).body.id);
        const results = await Promise.all(ids.map(id => api().post(`/ordens-servico/${ordemId}/servicos`).send({ servicoId: id })));
        expect(results.every(result => result.status === 201)).toBe(true);
        const salvo = await connection.collection('ordens_servico').findOne({ _id: new Types.ObjectId(ordemId) });
        expect(salvo?.totalCentavos).toBe(10179);
        expect(salvo?.servicos).toHaveLength(11);
        expect(salvo?.servicos.reduce((sum: number, item: { precoCentavos: number }) => sum + item.precoCentavos, 0)).toBe(salvo?.totalCentavos);
    });
    it('HU09 duas inclusões simultâneas do mesmo serviço cobram uma única vez', async () => {
        const criado = await api().post('/servicos').send({ nome: 'Duplo clique', precoPadrao: 0.01 }).expect(201);
        const results = await Promise.all([1, 2].map(() => api().post(`/ordens-servico/${ordemId}/servicos`).send({ servicoId: criado.body.id })));
        expect(results.map(item => item.status).sort()).toEqual([201, 409]);
        const salvo = await connection.collection('ordens_servico').findOne({ _id: new Types.ObjectId(ordemId) });
        expect(salvo?.totalCentavos).toBe(10180);
    });
    it('HU09 mantém compatibilidade com registros antigos sem total, itens ou ativo', async () => {
        const legado = await connection.collection('servicos').insertOne({ nome: 'Legado', precoPadrao: 0.3 });
        const antiga = await connection.collection('ordens_servico').insertOne({ descricao: 'Ordem antiga', data: '2026-10-30', veiculoId: new Types.ObjectId(veiculoId) });
        const result = await api().post(`/ordens-servico/${antiga.insertedId}/servicos`).send({ servicoId: legado.insertedId.toString() }).expect(201);
        expect(result.body.data.totalCentavos).toBe(30);
        expect(result.body.data.servicos).toHaveLength(1);
    });

    it('HU08 falha de persistência retorna erro e não salva registro parcial', async () => {
        const antes = await connection.collection('servicos').countDocuments();
        const spy = vi.spyOn(connection.model('Servico'), 'create').mockRejectedValueOnce(new Error('Falha de escrita simulada'));
        try {
            const result = await api().post('/servicos').send({ nome: 'Não salvar', precoPadrao: 10 }).expect(500);
            expect(result.body.success).toBe(false);
            expect(await connection.collection('servicos').countDocuments()).toBe(antes);
        } finally { spy.mockRestore(); }
    });
    it('HU09 falha de persistência preserva os itens e o total da ordem', async () => {
        const criado = await api().post('/servicos').send({ nome: 'Falha ao incluir', precoPadrao: 10 }).expect(201);
        const antes = await connection.collection('ordens_servico').findOne({ _id: new Types.ObjectId(ordemId) });
        const spy = vi.spyOn(connection.model('OrdemServico'), 'findOneAndUpdate').mockImplementationOnce(() => { throw new Error('Falha de escrita simulada'); });
        try {
            const result = await api().post(`/ordens-servico/${ordemId}/servicos`).send({ servicoId: criado.body.id }).expect(500);
            expect(result.body.success).toBe(false);
            const depois = await connection.collection('ordens_servico').findOne({ _id: new Types.ObjectId(ordemId) });
            expect(depois).toEqual(antes);
        } finally { spy.mockRestore(); }
    });
});
