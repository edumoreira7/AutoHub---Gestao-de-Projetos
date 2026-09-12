import Consulta from "../components/Consulta";
import { clientesDemo } from "../data/demonstracao";
export default function ConsultaClientes() {
  return (
    <Consulta
      grupo="Clientes"
      titulo="Consultar clientes"
      descricao="Encontre os contatos e dados de quem confia na sua oficina."
      novo={{ destino: "/clientes/novo", texto: "Novo cliente" }}
      registros={clientesDemo}
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
