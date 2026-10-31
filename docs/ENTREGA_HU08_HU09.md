# Entrega das histórias 8 e 9

Data: 31/10/2026. Implementação exclusivamente em `AutoHub - Main`.

Requisitos: exportação JSON do quadro AutoHub, histórias HU08 e HU09 e cartões 8.1–8.5 e 9.1–9.5. O Trello e o arquivo exportado não foram alterados.

## O que está disponível

- **Cadastrar serviço** no menu: nome e preço obrigatórios, orientação do formato monetário, confirmação de sucesso, tratamento de falhas e preservação dos dados para tentar novamente.
- **Serviços da ordem**: seleção de uma ordem existente e de um serviço ativo, conferência do serviço/preço/total previsto, confirmação, listagem dos itens e total confirmado pelo servidor.
- Após criar uma ordem, o link **Adicionar serviços à ordem criada** abre a inclusão com essa ordem selecionada.
- **Consultar ordens**: rota e menu conectados; resultados incluem serviços e total persistido.

## Matriz de implementação

| Cartão | Entrega | Evidência |
| --- | --- | --- |
| 8.1 | Serviço persistido com nome normalizado, preço positivo e situação ativa; tratamento de falha de gravação | Testes HTTP consultam o documento real no MongoDB isolado e conferem ausência de gravação em erros |
| 8.2 | `POST /servicos`, validações no servidor e respostas padronizadas | Testes HTTP com valores válidos, inválidos e falha de persistência |
| 8.3 | Tela `/servicos/novo`, campos e botão de confirmação | Testes Chromium em desktop e viewport móvel; capturas disponíveis |
| 8.4 | Formulário conectado à API; estados de envio, sucesso e erro | Fluxo completo no navegador, interrupção da comunicação e nova tentativa |
| 8.5 | Mensagem `Insira um valor numérico válido e maior que zero` | Testes com preço positivo, zero, negativo, letras, campo ausente, tipos inválidos e frações de centavo |
| 9.1 | Associação persistida dentro do documento da ordem; validação de existência e atividade | Testes HTTP conferem item e total armazenados no MongoDB |
| 9.2 | `POST /ordens-servico/:id/servicos`, corpo `{ servicoId }` | Testes de identificadores válidos/inválidos, serviço ausente/inativo e ordem inexistente |
| 9.3 | Tela `/ordens-servico/servicos` identifica a ordem, oferece serviços elegíveis e mostra confirmação prévia | Fluxo Chromium e teste de bloqueio do envio repetido |
| 9.4 | Preço recuperado do banco; item e incremento do total gravados atomicamente | Testes de requisições concorrentes, centavos exatos e adulteração de preço/total no corpo |
| 9.5 | Erros específicos, inclusive `Serviço não encontrado no sistema`; falhas não alteram a ordem | Testes HTTP de serviço inexistente/inativo e erro de escrita; mensagem exibida no navegador |

## Contrato da API

### Cadastro e listagem

`POST /servicos`

```json
{ "nome": "Troca de óleo", "precoPadrao": 100.29 }
```

`precoPadrao` deve ser um número JSON positivo, finito, representável em centavos inteiros. O formulário aceita vírgula ou ponto, com até duas casas decimais, e envia um número. Não aceita separador de milhares. `ativo` é opcional na API e, se presente, deve ser booleano; o padrão é `true`.

Retorno de cadastro: HTTP 201, `{ success, id, data, message }`. Validação inválida: HTTP 400, `{ success: false, message }`. Falha de escrita: HTTP 500, sem mensagem de sucesso.

`GET /servicos` retorna somente serviços ativos, ordenados por nome. Registros antigos sem o campo `ativo` continuam elegíveis, preservando a compatibilidade com HU08. Não foi criado fluxo de edição/inativação fora dessas histórias.

### Inclusão na ordem

`POST /ordens-servico/:id/servicos`

```json
{ "servicoId": "identificador MongoDB de 24 caracteres hexadecimais" }
```

A API ignora preços e totais enviados pelo cliente. Recupera nome/preço do serviço no banco e registra um item com `servicoId`, `nome` e `precoCentavos`. `totalCentavos` mantém a soma inteira; `total` é sua representação em reais na resposta. O nome e o preço do item permanecem como histórico mesmo se o catálogo mudar posteriormente.

Uma única atualização atômica do documento usa `$push` e `$inc`: não há gravação separada do item e do total. A condição da atualização impede dupla cobrança do mesmo serviço e estouro de inteiro seguro. Inclusões concorrentes de serviços diferentes não perdem valores.

Decisão de implementação: **um mesmo tipo de serviço pode ser incluído uma vez por ordem**, sem quantidade, pois as histórias não especificam multiplicidade. A regra está visível na tela. Repetição retorna HTTP 409. Ordem inexistente retorna 404; serviço ausente/inativo retorna 400. Valores legados de item/total ausentes são tratados como lista vazia e zero.

## Validação executada

| Verificação | Resultado |
| --- | --- |
| Frontend: TypeScript, build Vite e lint | Aprovados |
| Backend: build NestJS, TypeScript incluindo testes e lint de código/testes | Aprovados |
| Testes unitários Vitest | 28 aprovados |
| Integração HTTP com MongoDB real temporário | 25 aprovados |
| Chromium / Playwright | 6 aprovados |
| Conexão MongoDB do `.env` atual | Conexão e ping aprovados; nenhuma gravação de teste no banco configurado |
| Integridade das duas origens da consolidação | Zero arquivos originais alterados, conferidos pelos hashes do inventário |

**Total: 59 testes automatizados aprovados.**

O fluxo de regressão cobre cadastro e consulta de cliente, CPF inválido/duplicado, cadastro e consulta de veículo, proprietário inexistente, criação e consulta de ordem, veículo inexistente e data inválida. O navegador percorre cliente → veículo → ordem → serviço → inclusão, recarrega a página e confirma o total persistido. Também testa indisponibilidade da API, nova tentativa, dados preservados, envios repetidos e viewport de 390 px.

Os testes de persistência usam um processo MongoDB real separado (`mongodb-memory-server`), sem reutilizar o URI do `.env`. Nos cenários de falha de escrita, a falha é injetada deliberadamente no método do modelo; o documento real é conferido antes e depois. Não se trata de um teste de queda física do servidor MongoDB.

Evidências:

- `backend/playwright-report/index.html`: relatório de navegador.
- `backend/test-results/sprint2-consulta.png`: consulta com serviços e total.
- `backend/test-results/sprint2-inclusao.png`: itens e total após inclusão.
- `backend/test-results/sprint2-mobile.png`: cadastro em viewport móvel.
- `backend/src/modules/servico/servico.service.spec.ts`, `backend/src/modules/ordem-servico/ordem-servico.service.spec.ts`, `backend/test/sprint2.e2e-spec.ts` e `backend/test/browser/sprint2.spec.ts`: testes reproduzíveis.

## Como repetir

Com Node.js e npm instalados, instale as dependências com `npm ci` em `frontend` e `backend`. Para a primeira execução de navegador, dentro de `backend`, execute:

```bash
npx playwright install chromium
npm run test:all
```

`test:all` verifica lint/build do frontend, lint/testes do backend, build/integração e build/testes de navegador. Também é possível executar `npm test`, `npm run test:e2e` ou `npm run test:browser` separadamente em `backend`. A primeira execução de integração pode baixar o binário oficial do MongoDB. Os testes de navegador usam portas locais 3001 e 5174, que precisam estar livres; a aplicação normal usa 3000 e 5173.

Para desenvolvimento: `npm run start:dev` em `backend` e `npm run dev` em `frontend`. A configuração local existente foi mantida; `backend/.env.example` fornece um exemplo sem credenciais.

## Limites da verificação

Os resultados comprovam os cenários e o ambiente descritos; não representam garantia de ausência de qualquer defeito. A conexão configurada foi validada somente por ping, e os fluxos de escrita foram executados no banco isolado. Os alertas de dependências já registrados na consolidação continuam existentes e não foram corrigidos por atualizações de versão fora do escopo. Funcionalidades de estoque/orçamento citadas como objetivo geral do projeto não foram inventadas como parte de HU08/HU09.

O relatório de consolidação anterior é histórico. A limitação de HU08 sem endpoint/tela descrita naquele relatório foi resolvida por esta entrega.
