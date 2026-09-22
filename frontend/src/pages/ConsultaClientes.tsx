import Consulta from "../components/Consulta";
import { consultarClientes } from "../services/api";

function formatarCpf(cpf: string) {
  const digitos = cpf.replace(/\D/g, "");
  return digitos.length === 11
    ? digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    : cpf;
}

function formatarTelefone(telefone: string) {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length === 11)
    return digitos.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (digitos.length === 10)
    return digitos.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return telefone;
}

export default function ConsultaClientes() {
  return (
    <Consulta
      grupo="Clientes"
      titulo="Consultar clientes"
      descricao="Encontre os contatos e dados de quem confia na sua oficina."
      novo={{ destino: "/clientes/novo", texto: "Novo cliente" }}
      buscar={async (filtros) => {
        const clientes = await consultarClientes({
          nome: filtros.nome,
          cpf: filtros.cpf?.replace(/\D/g, ""),
          telefone: filtros.telefone?.replace(/\D/g, ""),
        });

        return clientes.map((cliente) => ({
          id: cliente._id,
          nome: cliente.nomeCompleto,
          cpf: formatarCpf(cliente.cpf),
          telefone: formatarTelefone(cliente.telefone),
          email: cliente.email,
          endereco: cliente.endereco || "Não informado",
        }));
      }}
      vazio="Nenhum cliente encontrado."
      campos={[
        {
          chave: "nome",
          titulo: "Nome",
          placeholder: "Ex.: Ana",
          validar: (v) =>
            v.length < 2 ? "Informe pelo menos 2 caracteres." : undefined,
        },
        {
          chave: "cpf",
          titulo: "CPF",
          placeholder: "CPF completo, com ou sem pontuação",
          validar: (v) =>
            !/^[\d.\-\s]+$/.test(v) || v.replace(/\D/g, "").length !== 11
              ? "Informe um CPF com 11 dígitos."
              : undefined,
        },
        {
          chave: "telefone",
          titulo: "Telefone",
          placeholder: "DDD e telefone",
          validar: (v) =>
            !/^[\d()\-\s]+$/.test(v) ||
            !/^\d{10,11}$/.test(v.replace(/\D/g, ""))
              ? "Informe DDD e telefone com 10 ou 11 dígitos."
              : undefined,
        },
      ]}
      colunas={[
        { chave: "nome", titulo: "Nome completo" },
        { chave: "cpf", titulo: "CPF" },
        { chave: "telefone", titulo: "Telefone" },
        { chave: "email", titulo: "E-mail" },
        { chave: "endereco", titulo: "Endereço" },
      ]}
    />
  );
}
