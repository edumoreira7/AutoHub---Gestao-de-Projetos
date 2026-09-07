# Modelagem do Sistema — AutoHub

> Documento de referência para desenvolvimento do front-end, back-end e banco de dados.
>
> Stack considerada no projeto: **React + NestJS + MongoDB/Mongoose**.
>
> A modelagem abaixo separa o que já está definido no Trello das decisões técnicas recomendadas para manter o sistema consistente.

---

## 1. Convenções gerais

- Banco de dados: MongoDB.
- ODM: Mongoose.
- Identificadores: `ObjectId`, gerados pelo MongoDB.
- Datas de criação e atualização: `createdAt` e `updatedAt`, geradas automaticamente com `timestamps: true`.
- Nomes de campos no código: `camelCase`.
- Nomes de collections: plural e em minúsculas.
- Relacionamentos entre entidades: referências por `ObjectId`.
- Validações importantes devem existir no back-end mesmo que também existam no front-end.

### Collections previstas

```text
autohub
├── clientes
├── veiculos
├── servicos
├── ordens_servico
└── pecas
```

Neste momento, **orçamento, histórico do veículo e relatórios não precisam obrigatoriamente de collections próprias**, pois podem ser obtidos a partir dos dados já armazenados.

---

# 2. Cliente

Collection: `clientes`

Representa o cliente da oficina e será vinculado aos veículos cadastrados.

## Estrutura

| Campo | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `_id` | ObjectId | Sim | Gerado automaticamente |
| `nomeCompleto` | String | Sim | Não pode ser vazio |
| `cpf` | String | Sim | Deve ser válido e único |
| `telefone` | String | Sim | Não pode ser vazio |
| `email` | String | Sim | Deve possuir formato válido |
| `endereco` | String | Não | Campo opcional |
| `createdAt` | Date | Sim | Gerado automaticamente |
| `updatedAt` | Date | Sim | Atualizado automaticamente |

## Regras

- Nome completo, CPF, telefone e e-mail são obrigatórios.
- CPF deve ser válido.
- CPF não pode estar duplicado.
- Endereço é opcional.
- Um cliente pode possuir vários veículos.

## Exemplo

```json
{
  "_id": "ObjectId",
  "nomeCompleto": "João da Silva",
  "cpf": "12345678909",
  "telefone": "11999999999",
  "email": "joao@email.com",
  "endereco": "Rua Exemplo, 100",
  "createdAt": "2026-09-07T20:00:00.000Z",
  "updatedAt": "2026-09-07T20:00:00.000Z"
}
```

---

# 3. Veículo

Collection: `veiculos`

Representa um veículo cadastrado e obrigatoriamente associado a um cliente.

## Estrutura

| Campo | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `_id` | ObjectId | Sim | Gerado automaticamente |
| `placa` | String | Sim | Identificação do veículo |
| `marca` | String | Sim | Não pode ser vazia |
| `modelo` | String | Sim | Não pode ser vazio |
| `ano` | Number | Sim | Ano do veículo |
| `cor` | String | Sim | Não pode ser vazia |
| `cliente` | ObjectId → Cliente | Sim | Cliente proprietário deve existir |
| `createdAt` | Date | Sim | Gerado automaticamente |
| `updatedAt` | Date | Sim | Atualizado automaticamente |

## Regras

- Placa, marca, modelo, ano e cor são obrigatórios.
- Todo veículo precisa estar vinculado a um cliente existente.
- Não deve ser possível cadastrar um veículo sem proprietário.
- A consulta deve permitir busca por placa, marca ou modelo.
- Ao consultar um veículo, deve ser possível recuperar o cliente proprietário.

## Decisão recomendada

**Recomenda-se tornar `placa` única**, pois dois veículos não deveriam possuir a mesma placa no sistema.

Essa regra é tecnicamente adequada, mas ainda não aparece explicitamente nos critérios de aceite atuais do Trello. A equipe deve confirmar antes de tratá-la como requisito oficial.

## Exemplo

```json
{
  "_id": "ObjectId",
  "placa": "ABC1D23",
  "marca": "Toyota",
  "modelo": "Corolla",
  "ano": 2022,
  "cor": "Prata",
  "cliente": "ObjectId(cliente)",
  "createdAt": "2026-09-07T20:00:00.000Z",
  "updatedAt": "2026-09-07T20:00:00.000Z"
}
```

---

# 4. Serviço

Collection: `servicos`

Representa um tipo de serviço oferecido pela oficina e que poderá ser adicionado às ordens de serviço.

## Estrutura mínima recomendada

| Campo | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `_id` | ObjectId | Sim | Gerado automaticamente |
| `nome` | String | Sim | Identifica o serviço |
| `precoPadrao` | Number | Sim | Deve ser numérico e maior que zero |
| `ativo` | Boolean | Sim | Indica se pode ser utilizado em novas OS |
| `createdAt` | Date | Sim | Gerado automaticamente |
| `updatedAt` | Date | Sim | Atualizado automaticamente |

## Regras já indicadas pelo Trello

- Um serviço deve possuir os dados obrigatórios para ser cadastrado.
- O preço padrão não pode ser negativo, zero ou conter letras.
- Apenas um serviço cadastrado e ativo deve ser adicionado a uma ordem de serviço.
- Se o serviço não existir, a operação deve ser impedida.

## Ponto a confirmar

O Trello cita busca/referência por **código ou nome** em um cenário, mas ainda não define formalmente um campo `codigo`.

Caso a equipe queira utilizar código de serviço, adicionar:

```text
codigo: String, obrigatório e único
```

Até essa decisão ser tomada, o `_id` pode ser usado internamente como identificador.

---

# 5. Ordem de Serviço

Collection: `ordens_servico`

Representa o atendimento realizado em um veículo.

A modelagem precisa atender não apenas à HU05, mas também às histórias de atualização de status, adição de serviços, consulta e orçamento.

## Estrutura

| Campo | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `_id` | ObjectId | Sim | Gerado automaticamente |
| `veiculo` | ObjectId → Veículo | Sim | Veículo deve existir |
| `descricao` | String | Não* | Descrição geral do atendimento |
| `dataOrdem` | Date | Sim | Data da ordem |
| `status` | String / Enum | Sim | Estado atual da OS |
| `servicos` | Array de ItemServico | Não | Serviços adicionados à OS |
| `valorTotal` | Number | Sim | Soma dos serviços; inicia em 0 |
| `createdAt` | Date | Sim | Gerado automaticamente |
| `updatedAt` | Date | Sim | Atualizado automaticamente |

\* O Trello atual menciona a descrição na tarefa da HU05, mas não deixa explícito no critério de aceite se ela é obrigatória.

## Item de serviço dentro da OS

```text
ItemServico
├── servico: ObjectId → Serviço
├── nomeServico: String
└── preco: Number
```

### Por que guardar nome e preço junto da OS?

É recomendado registrar um **snapshot** do serviço no momento em que ele é adicionado.

Exemplo: se hoje uma troca de óleo custa R$ 150 e daqui a seis meses o preço padrão passar para R$ 180, uma ordem antiga deve continuar mostrando R$ 150.

Assim:

```json
{
  "servico": "ObjectId(servico)",
  "nomeServico": "Troca de óleo",
  "preco": 150
}
```

é mais seguro historicamente do que depender apenas do preço atual da collection `servicos`.

## Status

A HU06 exige que a ordem possua um status válido, mas o Trello ainda não define quais status existem.

### Sugestão para a equipe validar

```text
ABERTA
EM_ANDAMENTO
CONCLUIDA
CANCELADA
```

Não implementar esse enum como regra definitiva antes de a equipe confirmar.

## Regras

- A OS só pode ser criada para um veículo previamente cadastrado.
- A OS não pode existir sem veículo vinculado.
- Serviços cadastrados podem ser adicionados à OS.
- Ao adicionar um serviço, o valor total deve ser atualizado.
- O status deve poder ser atualizado para um valor válido.
- A consulta de OS deve apresentar, entre outras informações, seu status.

## Exemplo

```json
{
  "_id": "ObjectId",
  "veiculo": "ObjectId(veiculo)",
  "descricao": "Revisão preventiva",
  "dataOrdem": "2026-09-07T20:00:00.000Z",
  "status": "ABERTA",
  "servicos": [
    {
      "servico": "ObjectId(servico)",
      "nomeServico": "Troca de óleo",
      "preco": 150
    }
  ],
  "valorTotal": 150,
  "createdAt": "2026-09-07T20:00:00.000Z",
  "updatedAt": "2026-09-07T20:00:00.000Z"
}
```

---

# 6. Peça / Estoque

Collection: `pecas`

O Trello já define que haverá cadastro, atualização de quantidade e consulta de peças, porém **ainda não define quais são todos os campos obrigatórios da peça**.

Por isso, esta parte não deve ser tratada como requisito fechado ainda.

## Estrutura mínima proposta

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| `_id` | ObjectId | Sim | Gerado automaticamente |
| `nome` | String | A confirmar | Nome da peça |
| `codigo` | String | A confirmar | Código interno |
| `quantidade` | Number | Sim | Não pode ficar negativa |
| `createdAt` | Date | Sim | Gerado automaticamente |
| `updatedAt` | Date | Sim | Atualizado automaticamente |

## Regras já definidas

- A peça deve poder ser cadastrada no estoque.
- Campos obrigatórios ausentes devem impedir o cadastro.
- Uma movimentação válida deve atualizar a quantidade.
- Uma movimentação que resulte em quantidade inválida deve ser impedida.
- A consulta deve apresentar as peças e suas respectivas quantidades.

## Antes de implementar HU10

A equipe precisa decidir quais serão os campos obrigatórios.

Sugestão simples:

```text
nome
codigo
quantidade
```

Outros campos como fabricante, preço de custo ou fornecedor podem ser adicionados futuramente, mas não são exigidos pelo backlog atual.

---

# 7. Orçamento

O backlog atual exige **gerar um orçamento**, mas não exige salvar ou manter histórico de orçamentos.

Por isso, inicialmente não é necessário criar uma collection `orcamentos`.

O orçamento pode ser montado a partir dos serviços associados ao atendimento/ordem de serviço.

## Estrutura de saída sugerida

```text
Orcamento
├── cliente
├── veiculo
├── itens[]
│   ├── descricao
│   └── valor
└── valorTotal
```

## Regras

- Deve existir pelo menos um serviço/item.
- Sem itens, o orçamento não pode ser gerado.
- O orçamento deve apresentar os itens correspondentes.
- O valor total pode ser calculado pela soma dos itens.

### Decisão futura

Se o sistema precisar de aprovação, validade, versões ou histórico de orçamento, então fará sentido criar uma collection `orcamentos`.

---

# 8. Histórico do Veículo

A história "Consultar histórico do veículo" não exige uma entidade ou collection separada.

O histórico pode ser obtido consultando:

```text
veiculo._id
        ↓
ordens_servico.veiculo
        ↓
ordens realizadas naquele veículo
```

Assim, uma consulta pode retornar todas as OS associadas ao veículo.

```text
Veículo
   1
   │
   └──────── N Ordens de Serviço
```

Isso evita duplicação de dados.

> O card atual dessa história ainda não possui descrição e critérios de aceite detalhados no Trello. Portanto, filtros, ordenação e informações exibidas devem ser definidos antes da implementação.

---

# 9. Relatórios Gerenciais

A história "Gerar relatórios gerenciais" também não exige uma collection própria.

Os relatórios podem ser produzidos através de consultas e agregações sobre:

- `clientes`
- `veiculos`
- `ordens_servico`
- `servicos`
- `pecas`

> O Trello atual ainda não especifica quais relatórios, indicadores, filtros ou períodos deverão existir. Esses requisitos precisam ser definidos antes da implementação da HU15.

---

# 10. Notificação de conclusão

A história "Notificar cliente sobre conclusão do serviço" não precisa alterar a modelagem principal agora.

O fluxo esperado poderá usar:

```text
Ordem de Serviço
       ↓
status = CONCLUIDA
       ↓
Veículo
       ↓
Cliente
       ↓
telefone/e-mail
```

Ou seja, os dados necessários para localizar o cliente já podem ser obtidos pelos relacionamentos existentes.

> O Trello atual ainda não possui descrição/critério detalhado para a HU16, portanto canal de notificação, conteúdo, registro de envio e tecnologia não devem ser definidos como requisito ainda.

---

# 11. Relacionamentos

```text
CLIENTE
  _id
   │
   │ 1
   │
   │ N
VEÍCULO
  _id
  cliente ───────────────► Cliente._id
   │
   │ 1
   │
   │ N
ORDEM DE SERVIÇO
  _id
  veiculo ───────────────► Veiculo._id
  servicos[]
      │
      └──────────────────► Servico._id


SERVIÇO
  _id
   ▲
   │
   └──── utilizado pelas Ordens de Serviço


PEÇA
  _id
  quantidade

(neste momento sem relacionamento obrigatório definido com OS)
```

## Cardinalidades

```text
Cliente  1 ───── N Veículos
Veículo  1 ───── N Ordens de Serviço
OS       N ───── N Serviços (por meio de itens na OS)
```

O relacionamento entre **Peça e Ordem de Serviço ainda não está definido no backlog atual**.

---

# 12. Visão resumida das collections

## clientes

```text
_id
nomeCompleto
cpf
telefone
email
endereco?
createdAt
updatedAt
```

## veiculos

```text
_id
placa
marca
modelo
ano
cor
cliente
createdAt
updatedAt
```

## servicos

```text
_id
nome
precoPadrao
ativo
createdAt
updatedAt
```

## ordens_servico

```text
_id
veiculo
descricao
dataOrdem
status
servicos[]
valorTotal
createdAt
updatedAt
```

## pecas

```text
_id
nome           [a confirmar]
codigo         [a confirmar]
quantidade
createdAt
updatedAt
```

---

# 13. Decisões pendentes antes de implementar cada módulo

| Tema | Situação |
|---|---|
| CPF único | Definido |
| Endereço do cliente opcional | Definido |
| Veículo obrigatoriamente ligado a cliente | Definido |
| Campos do veículo | Definidos |
| Placa única | Recomendado, mas ainda não oficial |
| Campos obrigatórios de Serviço | Parcialmente definidos |
| `precoPadrao > 0` | Definido |
| Campo `ativo` em Serviço | Necessário para atender cenário da HU09 |
| Código do Serviço | Citado, mas não formalmente definido |
| Campos básicos da OS | Parcialmente definidos |
| Status possíveis da OS | Ainda não definidos |
| Serviços dentro da OS | Definido conceitualmente |
| Atualização de `valorTotal` da OS | Definida na HU09 |
| Campos obrigatórios de Peça | Ainda não definidos |
| Quantidade de peça não negativa | Definido conceitualmente |
| Collection de orçamento | Não necessária pelo requisito atual |
| Collection de histórico | Não necessária |
| Tipos de relatórios | Ainda não definidos |
| Forma de notificação | Ainda não definida |

---

# 14. Ajustes necessários no Trello antes de continuar

## 14.1 MongoDB: usar "collection", não "tabela"

Nas tarefas de **Veículo** e **Ordem de Serviço**, ainda existem descrições utilizando o termo `tabela`.

Como o projeto está usando MongoDB/Mongoose, padronizar para:

```text
collection de veículos
collection de ordens de serviço
```

## 14.2 HU05 — descrições de tarefas estão desalinhadas com os títulos

No export atual do Trello há tarefas da HU05 em que o título e a descrição não representam a mesma atividade.

Exemplos:

- **5.3 — Criar endpoint para criação da ordem de serviço** possui descrição de criação de tela.
- **5.4 — Criar tela de ordem de serviço** possui descrição de seleção de veículo.
- **5.5 — Implementar seleção do veículo** possui descrição da lógica de criação/salvamento da OS.
- **5.7 — Integrar tela de ordem de serviço com a API** possui descrição de mensagem de sucesso.
- **5.8 — Exibir mensagem de sucesso** possui descrição de erro por falta de veículo.

Essas descrições devem ser corrigidas antes de os integrantes começarem a implementar a HU05, para evitar que duas pessoas desenvolvam responsabilidades diferentes do título da tarefa.

## 14.3 HU08, HU10, HU14, HU15 e HU16 ainda possuem decisões em aberto

Antes de iniciar essas histórias, detalhar:

- HU08: quais campos de Serviço são obrigatórios;
- HU10: quais campos de Peça são obrigatórios;
- HU14: o que exatamente será exibido no histórico;
- HU15: quais relatórios serão produzidos;
- HU16: como a notificação será enviada.

---

# 15. Regra de uso deste documento

Antes de criar ou alterar uma entidade:

1. conferir este documento;
2. conferir a história e os critérios de aceite no Trello;
3. se um novo campo ou regra for necessário, atualizar primeiro a modelagem;
4. implementar o Schema/DTO/API;
5. manter front-end e back-end utilizando os mesmos nomes e tipos;
6. atualizar este documento quando uma decisão de modelagem for aprovada pela equipe.

Assim, a modelagem funciona como o **contrato comum do AutoHub** entre os integrantes.
