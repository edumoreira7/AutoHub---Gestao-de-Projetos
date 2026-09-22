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

export interface NovoCliente {
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco?: string;
}

export async function cadastrarCliente(
  cliente: NovoCliente,
): Promise<ApiResponse> {
  const response = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cliente),
  });

  const body = (await response.json().catch(() => ({}))) as Partial<ApiResponse>;

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Não foi possível cadastrar o cliente.");
  }

  return body as ApiResponse;
}
