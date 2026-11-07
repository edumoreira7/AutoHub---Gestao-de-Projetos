import { test, expect } from '@playwright/test';

test('fluxo completo: cliente → veículo → ordem → serviço → inclusão → total persistido', async ({ page }) => {
    const erros: string[] = [];
    page.on('pageerror', error => erros.push(error.message));
    await page.goto('/clientes/novo');
    await page.getByLabel(/Nome completo/).fill('Ana Teste Navegador');
    await page.getByLabel(/CPF/).fill('52998224725');
    await page.getByLabel(/Telefone/).fill('11999990001');
    await page.getByLabel(/E-mail/i).fill('ana.browser@example.com');
    await page.getByRole('button', { name: /Cadastrar/ }).click();
    await expect(page.getByRole('status')).toContainText(/sucesso/i);

    await page.getByRole('link', { name: 'Consultar clientes' }).click();
    await page.getByRole('button', { name: 'Mostrar todos' }).click();
    await expect(page.getByRole('cell', { name: 'Ana Teste Navegador' })).toBeVisible();
    await page.getByRole('link', { name: 'Cadastrar veículos' }).click();
    await page.getByLabel(/Placa/).fill('ABC1D23');
    await page.getByLabel(/Marca/).fill('Fiat');
    await page.getByLabel(/Modelo/).fill('Uno');
    await page.getByLabel(/Ano/).fill('2020');
    await page.getByLabel(/Cor/).fill('Prata');
    await page.getByLabel(/Cliente proprietário/).selectOption({ label: 'Ana Teste Navegador - 52998224725' });
    await page.getByRole('button', { name: /Cadastrar/ }).click();
    await expect(page.getByRole('status')).toContainText('Veículo cadastrado com sucesso');
    await page.getByRole('link', { name: 'Consultar veículos' }).click();
    await page.getByRole('button', { name: 'Mostrar todos' }).click();
    await expect(page.getByRole('cell', { name: 'ABC1D23' })).toBeVisible();

    await page.getByRole('link', { name: 'Cadastrar ordem' }).click();
    await page.getByLabel(/Descrição dos serviços/).fill('Revisão do navegador');
    await page.getByLabel(/Data da ordem/).fill('2026-10-31');
    await page.getByLabel(/^Veículo/).selectOption({ index: 1 });
    await page.getByRole('button', { name: /Criar ordem/ }).click();
    await expect(page.getByRole('status')).toContainText('Ordem de serviço cadastrada com sucesso');
    const adicionar = page.getByRole('link', { name: 'Adicionar serviços à ordem criada' });
    const href = await adicionar.getAttribute('href');

    await page.getByRole('link', { name: 'Cadastrar serviço', exact: true }).click();
    await page.getByLabel(/Nome do serviço/).fill('Troca de óleo navegador');
    for (const preco of ['0', '-50', 'abc', '1,234', '']) {
        await page.getByLabel(/Preço padrão/).fill(preco);
        await page.getByRole('button', { name: /Cadastrar serviço/ }).click();
        await expect(page.getByRole('alert')).toHaveText('Insira um valor numérico válido e maior que zero');
        await expect(page.getByLabel(/Nome do serviço/)).toHaveValue('Troca de óleo navegador');
    }
    await page.getByLabel(/Preço padrão/).fill('100,29');
    await page.getByRole('button', { name: /Cadastrar serviço/ }).click();
    await expect(page.getByRole('status')).toHaveText('Serviço cadastrado com sucesso');
    await page.goto(href!);
    await expect(page.getByLabel('Ordem de serviço', { exact: false })).not.toHaveValue('');
    await page.getByLabel(/Serviço ativo/).selectOption({ index: 1 });
    await expect(page.getByText('Total previsto:')).toContainText('100,29');
    await page.getByRole('button', { name: 'Confirmar adição' }).click();
    await expect(page.getByRole('status')).toHaveText('Serviço adicionado à ordem com sucesso');
    await expect(page.getByRole('cell', { name: 'Troca de óleo navegador' })).toBeVisible();
    await expect(page.getByText('Total da ordem:')).toContainText('100,29');
    await page.reload();
    await expect(page.getByRole('cell', { name: 'Troca de óleo navegador' })).toBeVisible();
    await expect(page.getByText('Total da ordem:')).toContainText('100,29');
    await expect(page.getByRole('button', { name: 'Confirmar adição' })).toBeDisabled();
    await page.getByRole('link', { name: 'Consultar ordens', exact: true }).click();
    await page.getByRole('button', { name: 'Mostrar todos' }).click();
    await expect(page.getByRole('cell', { name: 'Troca de óleo navegador' })).toBeVisible();
    await expect(page.getByRole('cell', { name: /100,29/ })).toBeVisible();
    const editorStatus = page.getByRole('combobox', { name: /Status da ordem/ });
    await expect(editorStatus).toHaveValue('ABERTA');
    await editorStatus.selectOption('EM_ANDAMENTO');
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(editorStatus).toHaveValue('ABERTA');
    await editorStatus.selectOption('EM_ANDAMENTO');
    await page.route('**/ordens-servico/*/status', route => route.abort('failed'));
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Não foi possível conectar à API');
    await expect(editorStatus).toHaveValue('ABERTA');
    await page.unroute('**/ordens-servico/*/status');
    await editorStatus.selectOption('CONCLUIDA');
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
    await expect(page.getByText('Status salvo.', { exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Mostrar todos' }).click();
    await expect(editorStatus).toHaveValue('CONCLUIDA');
    await page.screenshot({ path: 'test-results/sprint2-consulta.png', fullPage: true });
    expect(erros).toEqual([]);
});

test('cadastro trata falha da API e preserva dados para tentar novamente', async ({ page }) => {
    await page.goto('/servicos/novo');
    await page.getByLabel(/Nome do serviço/).fill('Alinhamento');
    await page.getByLabel(/Preço padrão/).fill('80.50');
    await page.route('**/servicos', route => route.abort('failed'));
    await page.getByRole('button', { name: /Cadastrar serviço/ }).click();
    await expect(page.getByRole('alert')).toHaveText('Não foi possível conectar à API.');
    await expect(page.getByLabel(/Nome do serviço/)).toHaveValue('Alinhamento');
    await expect(page.getByLabel(/Preço padrão/)).toHaveValue('80.50');
    await page.unroute('**/servicos');
    await page.getByRole('button', { name: /Cadastrar serviço/ }).click();
    await expect(page.getByRole('status')).toHaveText('Serviço cadastrado com sucesso');
});

test('cadastro bloqueia envio duplicado enquanto aguarda a API', async ({ page }) => {
    await page.goto('/servicos/novo');
    await page.getByLabel(/Nome do serviço/).fill('Balanceamento');
    await page.getByLabel(/Preço padrão/).fill('20');
    let liberar!: () => void;
    const espera = new Promise<void>(resolve => { liberar = resolve; });
    let chamadas = 0;
    await page.route('**/servicos', async route => { chamadas++; await espera; await route.continue(); });
    await page.getByRole('button', { name: /Cadastrar serviço/ }).click();
    await expect(page.getByRole('button', { name: 'Salvando...' })).toBeDisabled();
    expect(chamadas).toBe(1);
    liberar();
    await expect(page.getByRole('status')).toHaveText('Serviço cadastrado com sucesso');
});

test('falha ao carregar ordens oferece nova tentativa', async ({ page }) => {
    await page.route('**/ordens-servico', route => route.abort('failed'));
    await page.goto('/ordens-servico/servicos');
    await expect(page.getByRole('alert')).toHaveText('Não foi possível conectar à API.');
    await expect(page.getByRole('button', { name: 'Confirmar adição' })).toBeDisabled();
    await page.unroute('**/ordens-servico');
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.getByLabel(/Ordem de serviço/)).toBeEnabled();
});

test('formulário de serviços funciona em viewport móvel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/servicos/novo');
    await expect(page.getByLabel(/Nome do serviço/)).toBeVisible();
    await expect(page.getByLabel(/Preço padrão/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Cadastrar serviço/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'test-results/sprint2-mobile.png', fullPage: true });
});

test('inclusão apresenta erro da API, preserva seleção e bloqueia duplo envio', async ({ page }) => {
    await page.goto('/ordens-servico/servicos');
    await page.getByLabel(/Ordem de serviço/).selectOption({ index: 1 });
    await page.getByLabel(/Serviço ativo/).selectOption({ index: 1 });
    const escolhido = await page.getByLabel(/Serviço ativo/).inputValue();
    await page.route('**/ordens-servico/*/servicos', route => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Serviço não encontrado no sistema' }) }));
    await page.getByRole('button', { name: 'Confirmar adição' }).click();
    await expect(page.getByRole('alert')).toHaveText('Serviço não encontrado no sistema');
    await expect(page.getByLabel(/Serviço ativo/)).toHaveValue(escolhido);
    await page.unroute('**/ordens-servico/*/servicos');
    let liberar!: () => void;
    const espera = new Promise<void>(resolve => { liberar = resolve; });
    let chamadas = 0;
    await page.route('**/ordens-servico/*/servicos', async route => { chamadas++; await espera; await route.continue(); });
    await page.getByRole('button', { name: 'Confirmar adição' }).click();
    await expect(page.getByRole('button', { name: 'Adicionando...' })).toBeDisabled();
    expect(chamadas).toBe(1);
    liberar();
    await expect(page.getByRole('status')).toHaveText('Serviço adicionado à ordem com sucesso');
    await page.screenshot({ path: 'test-results/sprint2-inclusao.png', fullPage: true });
});
