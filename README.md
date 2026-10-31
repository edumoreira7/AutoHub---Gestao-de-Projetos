# AutoHub

Sistema de gestão para oficinas mecânicas, desenvolvido como projeto acadêmico da disciplina **Gestão de Projetos**.

## Sobre o Projeto

O AutoHub é uma aplicação web voltada para o **uso interno de oficinas mecânicas**, com o objetivo de centralizar e organizar os principais processos da oficina em um único sistema.

## Funcionalidades

- Cadastro e gerenciamento de clientes
- Cadastro e gerenciamento de veículos
- Gerenciamento de ordens de serviço
- Cadastro e gerenciamento de serviços, com associação de serviços às ordens e cálculo do total
- Controle de peças e estoque
- Criação e acompanhamento de orçamentos
- Histórico de serviços dos veículos

## Integrantes e Papéis

| Integrante | Papel |
|---|---|
| Eduardo Gonçalves Moreira | Product Owner |
| David Gabriel de Souza Batista | Dev |
| Gabriel dos Santos Silva | Dev |
| Gabriel Machado da Silva | Scrum Master |

## Objetivo

Facilitar a gestão de oficinas mecânicas, proporcionando maior organização, controle e acompanhamento dos processos internos.

## Público-alvo

O sistema é destinado principalmente a:

- Proprietários e gestores de oficinas mecânicas
- Atendentes e recepcionistas
- Mecânicos
- Responsáveis pelo controle de estoque

## Tecnologias

- Front-end: React, TypeScript e Vite
- Back-end: NestJS, TypeScript e Mongoose
- Banco de dados: MongoDB

## Como rodar o projeto

### Pré-requisitos

- Node.js e npm instalados
- Para usar os dados reais: uma conexão MongoDB, por exemplo, um cluster MongoDB Atlas
- Para testar sem banco: nenhum MongoDB é necessário

### Back-end

Os comandos npm devem ser executados dentro de `backend` ou `frontend`; a raiz do repositório não possui `package.json`. Se estiver usando PowerShell na raiz, você também pode usar `npm --prefix .\backend ...` e `npm --prefix .\frontend ...`.

Na pasta `backend`, instale as dependências:

```bash
npm install
```

#### Executar sem conexão MongoDB (modo local)

Este modo salva clientes, veículos, ordens de serviço e serviços em arquivos JSON dentro de `backend/.local-data`. No terminal da pasta `backend`, execute:

```bash
npm run start:local
```

Os dados locais são apenas para desenvolvimento e **não são enviados automaticamente ao MongoDB**.

#### Executar com MongoDB Atlas

Crie `backend/.env` com a URI real copiada em **Atlas → Connect → Drivers**:

```env
MONGO_URI=mongodb+srv://USUARIO:SENHA@SEU-CLUSTER.mongodb.net/?retryWrites=true&w=majority
```

Substitua os valores de exemplo e não compartilhe nem versione a URI. Depois, use o modo normal:

```bash
npm run start:dev
```

Opcionalmente, defina `PORT` e `FRONTEND_URL`. Os valores padrão são `3000` e `http://localhost:5173`.

A API ficará disponível em `http://localhost:3000` em ambos os modos.

### Serviços e ordens de serviço

Na aplicação, use **Cadastrar serviço** para informar nome, preço padrão e situação ativa. Em seguida, acesse **Adicionar serviço à ordem**, selecione uma OS e um serviço ativo. O serviço não pode ser repetido na mesma ordem; o preço é copiado do cadastro e a API atualiza o total. As rotas correspondentes são `POST/GET /servicos` e `POST /ordens-servico/:id/servicos`.

### Front-end

Em outro terminal, na pasta `frontend`, instale as dependências:

```bash
npm install
```

Se a API estiver em outro endereço, crie `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

Inicie a aplicação:

```bash
npm run dev
```

O Vite mostrará no terminal o endereço da aplicação, normalmente `http://localhost:5173`.

### Verificações

Para conferir o código antes de enviar alterações, execute `npm run lint` e `npm run build` dentro das pastas `frontend` e `backend`.

## Definition of Done (DoD)

Uma história de usuário será considerada **concluída** quando:

- Todas as tarefas necessárias para sua implementação estiverem concluídas;
- A funcionalidade estiver implementada conforme os requisitos definidos na história;
- Front-end, back-end e banco de dados estiverem integrados, quando aplicáveis à história;
- Os critérios de aceite definidos para a história forem atendidos;
- A funcionalidade tiver sido testada e apresentar o comportamento esperado;
- As validações de dados previstas estiverem funcionando;
- O código estiver versionado e integrado ao repositório GitHub da equipe;
- Não existirem erros conhecidos que impeçam o uso da funcionalidade.
---

> Projeto acadêmico desenvolvido para a disciplina de **Gestão de Projetos**.
