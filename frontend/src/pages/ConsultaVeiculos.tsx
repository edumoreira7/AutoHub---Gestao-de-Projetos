import Consulta from "../components/Consulta";
import { consultarVeiculos } from "../services/api";

export default function ConsultaVeiculos() {
  const texto = (v: string) =>
    v.length < 2 ? "Informe pelo menos 2 caracteres." : undefined;

  return (
    <Consulta
      grupo="Veículos"
      titulo="Consultar veículos"
      descricao="Localize o veículo e identifique seu proprietário."
      novo={{ destino: "/veiculos/novo", texto: "Novo veículo" }}
      buscar={async (filtros) => {
        const veiculos = await consultarVeiculos({
          placa: filtros.placa,
          marca: filtros.marca,
          modelo: filtros.modelo,
        });

        return veiculos.map((veiculo) => ({
          id: veiculo._id,
          placa: veiculo.placa,
          marca: veiculo.marca,
          modelo: veiculo.modelo,
          ano: String(veiculo.ano),
          cor: veiculo.cor,
          cliente: veiculo.cliente ?? "Cliente não encontrado",
        }));
      }}
      vazio="Nenhum veículo encontrado."
      campos={[
        {
          chave: "placa",
          titulo: "Placa",
          placeholder: "Ex.: ABC1D23 ou ABC-1234",
          validar: (v) =>
            !/^[a-z]{3}[- ]?[0-9][a-z0-9][0-9]{2}$/i.test(v)
              ? "Informe uma placa válida, antiga ou Mercosul."
              : undefined,
        },
        {
          chave: "marca",
          titulo: "Marca",
          placeholder: "Ex.: Volkswagen",
          validar: texto,
        },
        {
          chave: "modelo",
          titulo: "Modelo",
          placeholder: "Ex.: Gol",
          validar: texto,
        },
      ]}
      colunas={[
        { chave: "placa", titulo: "Placa" },
        { chave: "marca", titulo: "Marca" },
        { chave: "modelo", titulo: "Modelo" },
        { chave: "ano", titulo: "Ano" },
        { chave: "cor", titulo: "Cor" },
        { chave: "cliente", titulo: "Proprietário" },
      ]}
    />
  );
}
