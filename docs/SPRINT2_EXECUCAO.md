# Sprint 2 integrada — execução e revisão

A branch `integracao/autohub` reúne HU06, HU07, HU08 e HU09. Use a pasta `AutoHub-integracao` para executar esta versão.

## Rodar

1. Em `backend`, executar `npm ci` se necessário. Configurar `.env` com `MONGO_URI` e, opcionalmente, `MONGO_DB_NAME`. Usar banco de demonstração separado para dados fictícios.
2. Iniciar `npm run start:dev` em `backend` (porta padrão 3000).
3. Em outro terminal, executar `npm ci` se necessário e `npm run dev` em `frontend` (porta padrão 5173).
4. Se a API estiver em outro endereço, configurar `VITE_API_URL` em `frontend/.env.local`.

## Contrato e dados antigos

Status aprovados no Trello: `ABERTA`, `EM_ANDAMENTO`, `CONCLUIDA`, `CANCELADA`. Novas ordens começam em `ABERTA`. Registros sem status retornam `null` e aparecem como “Status não informado”; consultar não modifica documentos.

Valores antigos fora do contrato, como `CONCLUÍDA` ou `AGUARDANDO_PEÇAS`, aparecem identificados como status legado. O usuário pode selecionar e confirmar um dos quatro valores válidos. Não há migração automática nem exclusão de documentos. O endpoint rejeita valores fora do contrato.

A inclusão de serviços usa `precoCentavos` nos itens e `totalCentavos` na ordem. Dados de outra versão com `preco`/`valorTotal` precisam de conversão avaliada separadamente; não são convertidos automaticamente.

## Demonstração

Cadastrar cliente e veículo fictícios. Criar uma ordem “Revisão Sprint 2”. Em Consultar ordens, clicar Mostrar todos, conferir identificação e status; alterar para Em andamento e confirmar. Recarregar e consultar novamente. Pesquisar uma descrição inexistente para mostrar a mensagem de lista vazia.

Em Cadastrar serviço, tentar preço zero e depois cadastrar “Troca de óleo” por 100,29. Em Serviços da ordem, selecionar a OS e o serviço, conferir o total previsto e confirmar. Adicionar “Alinhamento” por 80,00: total esperado 180,29. Recarregar e conferir itens/total; voltar à consulta para mostrar persistência e integração.

## Verificação

Em `backend`, executar `npm run test:all`. Para a primeira execução de navegador, instalar Chromium com `npx playwright install chromium`. As suítes usam MongoDB temporário separado do banco configurado da oficina e portas de navegador 3001/5174.

A suíte HTTP verifica os quatro status, status inválidos, ordem inexistente, consulta após alteração, lista vazia e legado sem gravação retroativa. O fluxo Chromium verifica cancelar, erro de comunicação com retorno ao valor anterior, confirmação de status e persistência após recarga, além do fluxo completo de serviços.

Referências: HU06 https://trello.com/c/kVb4JRbh ; HU07 https://trello.com/c/tkeuvf3h ; HU09 https://trello.com/c/4Fn6YQi6 . Nenhum cartão foi alterado por esta revisão.
