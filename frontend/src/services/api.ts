const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  id?: string;
  data?: T;
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error("Não foi possível conectar à API.");
  }

  const body = (await response.json().catch(() => ({}))) as Partial<
    ApiResponse<T>
  >;

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Não foi possível concluir a operação.");
  }

  return body as ApiResponse<T>;
}

export interface NovoCliente {
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco?: string;
}

export interface Cliente {
  _id: string;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco?: string;
}

export interface FiltrosCliente {
  nome?: string;
  cpf?: string;
  telefone?: string;
}

export interface NovoVeiculo {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  clienteId: string;
}

export interface Veiculo {
  _id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  clienteId?: string;
  cliente?: string;
}

export interface FiltrosVeiculo {
  placa?: string;
  marca?: string;
  modelo?: string;
}

export interface NovaOrdemServico {
  descricao: string;
  data: string;
  veiculoId: string;
}

export interface OrdemServico {
  _id: string;
  descricao: string;
  data: string;
  veiculoId?: string;
  veiculo?: string;
  servicos?: { servicoId: string; nome: string; precoCentavos: number }[];
  totalCentavos?: number;
  total?: number;
}

export interface Servico { _id: string; nome: string; precoPadrao: number; ativo: boolean }
export async function cadastrarServico(dados: { nome: string; precoPadrao: number }) {
  return request<Servico>('/servicos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
}
export async function consultarServicos(): Promise<Servico[]> {
  return (await request<Servico[]>('/servicos')).data ?? [];
}
export async function adicionarServicoOrdem(ordemId: string, servicoId: string): Promise<OrdemServico> {
  const resposta = await request<OrdemServico>(`/ordens-servico/${encodeURIComponent(ordemId)}/servicos`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ servicoId }),
  });
  if (!resposta.data) throw new Error('A API não retornou a ordem atualizada.');
  return resposta.data;
}

export interface FiltrosOrdemServico {
  descricao?: string;
  data?: string;
  veiculoId?: string;
}

export async function cadastrarCliente(
  cliente: NovoCliente,
): Promise<ApiResponse> {
  return request("/clientes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cliente),
  });
}

export async function consultarClientes(
  filtros: FiltrosCliente,
): Promise<Cliente[]> {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor?.trim()) params.set(chave, valor.trim());
  });

  const query = params.toString();
  const response = await request<Cliente[]>(
    `/clientes${query ? `?${query}` : ""}`,
  );

  return response.data ?? [];
}

export async function cadastrarVeiculo(
  veiculo: NovoVeiculo,
): Promise<ApiResponse> {
  return request("/veiculos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(veiculo),
  });
}

export async function consultarVeiculos(
  filtros: FiltrosVeiculo = {},
): Promise<Veiculo[]> {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor?.trim()) params.set(chave, valor.trim());
  });

  const query = params.toString();
  const response = await request<Veiculo[]>(
    `/veiculos${query ? `?${query}` : ""}`,
  );

  return response.data ?? [];
}

export async function cadastrarOrdemServico(
  ordem: NovaOrdemServico,
): Promise<ApiResponse> {
  return request("/ordens-servico", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ordem),
  });
}

export async function consultarOrdensServico(
  filtros: FiltrosOrdemServico = {},
): Promise<OrdemServico[]> {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor?.trim()) params.set(chave, valor.trim());
  });

  const query = params.toString();
  const response = await request<OrdemServico[]>(
    `/ordens-servico${query ? `?${query}` : ""}`,
  );

  return (response.data ?? []).map((ordem) => ({
    ...ordem,
    veiculo: ordem.veiculo ?? "Veículo não encontrado",
  }));
}
