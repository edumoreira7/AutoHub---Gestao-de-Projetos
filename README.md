# AutoHub

Sistema de gestão para oficinas mecânicas, desenvolvido como projeto acadêmico da disciplina **Gestão de Projetos**.

## Sobre o Projeto

O AutoHub é uma aplicação web voltada para o **uso interno de oficinas mecânicas**, com o objetivo de centralizar e organizar os principais processos da oficina em um único sistema.

## Funcionalidades

- Cadastro e gerenciamento de clientes
- Cadastro e gerenciamento de veículos
- Gerenciamento de ordens de serviço
- Gerenciamento de serviços
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
- MongoDB disponível localmente ou por uma conexão externa

### Back-end

Na pasta `backend`, instale as dependências:

```bash
npm install
```

Crie o arquivo `backend/.env` com a conexão do MongoDB:

```env
MONGO_URI=mongodb://localhost:27017/autohub
```

Opcionalmente, defina também `PORT` e `FRONTEND_URL`. Os valores padrão são `3000` e `http://localhost:5173`.

Inicie a API:

```bash
npm run start:dev
```

A API ficará disponível em `http://localhost:3000`.

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
