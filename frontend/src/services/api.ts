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
