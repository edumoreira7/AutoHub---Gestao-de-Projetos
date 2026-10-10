# AutoHub — Gestão para Oficina

Guia de execução e apresentação do projeto AutoHub, incluindo a inicialização do sistema, a explicação da API REST e a demonstração das Histórias de Usuário (HU1 a HU5).

## 1. Como executar o projeto no VS Code

### Pré-requisitos

- [Node.js 22.12 ou superior](https://nodejs.org/)
- [Visual Studio Code](https://code.visualstudio.com/)
- Terminal PowerShell ou equivalente

### Executando o backend (API)

Abra um terminal no VS Code e execute:

```bash
cd backend
npm install
npm run start:dev
```

A API estará disponível em:

`http://localhost:3000`

### Executando o frontend (interface)

Abra um **segundo terminal** no VS Code e execute:

```bash
cd frontend
npm install
npm run dev
```

O Vite exibirá a URL para acessar a interface, normalmente:

- `http://localhost:5173`
- `http://localhost:5174` (caso a porta padrão esteja ocupada)

Abra a URL indicada pelo terminal no navegador.

> **Problema comum:** se o terminal informar que `npm` não é reconhecido, instale o Node.js e reinicie o VS Code.

---

## 2. API utilizada

O AutoHub utiliza uma **API REST própria, desenvolvida com NestJS**. Portanto, não depende de uma API externa para executar suas funcionalidades.

A comunicação entre o frontend e o backend ocorre por meio de requisições HTTP, utilizando dados no formato JSON.

O backend recebe as requisições, valida as informações, executa as operações solicitadas e retorna os dados ou mensagens de erro correspondentes.

### Endpoints disponíveis

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/clientes` | Cadastra um cliente. |
| `GET` | `/clientes?nome=&cpf=&telefone=` | Consulta clientes por nome, CPF ou telefone. |
| `POST` | `/veiculos` | Cadastra um veículo vinculado a um cliente. |
| `GET` | `/veiculos?placa=&marca=&modelo=` | Consulta veículos por placa, marca ou modelo, incluindo o proprietário. |
| `POST` | `/ordens-servico` | Cria uma ordem de serviço vinculada a um veículo existente. |

### Persistência dos dados

Atualmente, o projeto utiliza arquivos JSON locais para armazenar os dados, permitindo executar o sistema sem precisar instalar o MongoDB.

Os arquivos são armazenados em:

```text
backend/
└── data/
    ├── clientes.json
    ├── veiculos.json
    └── ordens-servico.json
```

Esses arquivos são ignorados pelo Git e, por isso, não acompanham o projeto ao cloná-lo em outro computador.

**Importante:** ao executar o projeto em outro computador, cadastre novamente os dados necessários para a demonstração.

---

## 3. Histórias de Usuário implementadas

### HU1 — Cadastrar cliente

Permite que o funcionário cadastre clientes informando:

- Nome completo;
- CPF;
- Telefone;
- E-mail.

**Validações implementadas:**

- Verificação dos campos obrigatórios;
- CPF com 11 dígitos;
- Telefone com 11 dígitos;
- Impedimento de CPF duplicado;
- Impedimento de e-mail duplicado;
- Mensagens de sucesso ou erro após a operação.

**Observação:** a validação atual do CPF verifica a quantidade de dígitos e o formato, mas não calcula os dígitos verificadores.

### HU2 — Consultar clientes

Permite localizar clientes utilizando um ou mais dos seguintes critérios:

- Nome;
- CPF;
- Telefone.

Os resultados são apresentados na interface, e o sistema informa quando nenhum cliente corresponde à pesquisa.

O botão **Mostrar todos** permite consultar os clientes sem aplicar filtros.

### HU3 — Cadastrar veículo

Permite registrar veículos com as seguintes informações:

- Placa;
- Marca;
- Modelo;
- Ano;
- Cor;
- Cliente proprietário.

O funcionário seleciona um cliente previamente cadastrado. O sistema utiliza o identificador desse cliente para estabelecer o vínculo entre o veículo e seu proprietário.

O cadastro valida a existência do cliente selecionado e apresenta o resultado da operação.

### HU4 — Consultar veículos

Permite pesquisar veículos pelos seguintes critérios:

- Placa;
- Marca;
- Modelo.

Os resultados apresentam as informações do veículo e os dados do cliente proprietário.

A funcionalidade também oferece o botão **Mostrar todos** e informa quando a pesquisa não encontra resultados.

### HU5 — Criar ordem de serviço

Permite registrar ordens de serviço com:

- Descrição dos serviços;
- Data;
- Veículo relacionado.

Para criar uma ordem, é obrigatório selecionar um veículo previamente cadastrado.

A API valida o vínculo com o veículo, registra a ordem e retorna uma mensagem indicando o resultado da operação.

---

## 4. Roteiro para demonstração

Para apresentar as funcionalidades do AutoHub, recomenda-se seguir esta sequência:

1. **Cadastro de cliente:** registre um cliente e demonstre a mensagem de confirmação.
2. **Consulta de clientes:** pesquise pelo nome, CPF ou telefone. Em seguida, utilize o botão Mostrar todos e realize uma pesquisa sem resultados.
3. **Cadastro de veículo:** cadastre um veículo selecionando um cliente existente. Demonstre também a validação ao tentar enviar o formulário sem um proprietário.
4. **Consulta de veículos:** pesquise por placa, marca ou modelo e mostre os dados do proprietário retornados pelo sistema.
5. **Criação de ordem de serviço:** registre uma ordem informando a descrição, a data e o veículo relacionado. Por fim, tente enviar o formulário sem selecionar um veículo para demonstrar a validação obrigatória.

---

## 5. Limitações conhecidas

O AutoHub possui os fluxos das cinco histórias de usuário implementados para demonstração local. Entretanto, a persistência atual utiliza arquivos JSON, e não uma conexão com o MongoDB.

Consequentemente:

- Os dados são armazenados em arquivos locais;
- Os arquivos JSON não são enviados ao repositório Git;
- Uma nova cópia do projeto não terá os dados de demonstração anteriores;
- As funcionalidades que exigem persistência em MongoDB ainda dependem da integração com esse banco de dados.

**Nota:** os arquivos JSON são uma solução temporária de persistência local e não devem ser apresentados como tabelas de um banco de dados MongoDB.

---

## 6. Tecnologias utilizadas

- **Node.js:** ambiente de execução do backend.
- **NestJS:** framework utilizado no desenvolvimento da API REST.
- **JavaScript/TypeScript:** tecnologias utilizadas na aplicação, conforme a implementação de cada camada.
- **Vite:** ferramenta de desenvolvimento e execução do frontend.
- **JSON:** formato utilizado na comunicação entre frontend e backend e no armazenamento local dos dados.
- **Git e GitHub:** controle de versão e hospedagem do código-fonte.

---

*AutoHub — Sistema de gestão para oficina mecânica | Projeto acadêmico*
