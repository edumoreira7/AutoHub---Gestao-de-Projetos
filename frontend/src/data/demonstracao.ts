// Dados fictícios exclusivos para a revisão das telas. Não representam o banco.
export const clientesDemo = [
  {
    id: "demo-1",
    nome: "Ana Silva (exemplo)",
    cpf: "529.982.247-25",
    telefone: "(11) 99999-0001",
    email: "ana@example.com",
    endereco: "Rua Exemplo, 100",
  },
  {
    id: "demo-2",
    nome: "Carlos Souza (exemplo)",
    cpf: "111.444.777-35",
    telefone: "(11) 98888-0002",
    email: "carlos@example.com",
    endereco: "Avenida Exemplo, 200",
  },
];
export const veiculosDemo = [
  {
    id: "veiculo-demo-1",
    placa: "ABC1D23",
    marca: "Volkswagen",
    modelo: "Gol",
    ano: "2020",
    cor: "Prata",
    cliente: clientesDemo[0].nome,
  },
  {
    id: "veiculo-demo-2",
    placa: "XYZ9876",
    marca: "Fiat",
    modelo: "Argo",
    ano: "2022",
    cor: "Vermelho",
    cliente: clientesDemo[1].nome,
  },
];
