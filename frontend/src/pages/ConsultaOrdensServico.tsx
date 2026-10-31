import Consulta from "../components/Consulta";
import { consultarOrdensServico } from "../services/api";
import { moeda } from '../utils/moeda';

export default function ConsultaOrdensServico() {
  return (
    <Consulta
      grupo="Ordens de serviço"
      titulo="Consultar ordens de serviço"
      descricao="Localize ordens por veículo, descrição ou data."
      novo={{ destino: "/ordens-servico/nova", texto: "Nova ordem" }}
      buscar={async (filtros) => {
        const ordens = await consultarOrdensServico({
          descricao: filtros.descricao,
          data: filtros.data,
          veiculoId: filtros.veiculoId,
        });

        return ordens.map((ordem) => ({
          id: ordem._id,
          descricao: ordem.descricao,
          data: ordem.data,
          veiculo: ordem.veiculo ?? "Veículo não encontrado",
          servicos: ordem.servicos?.map(item => item.nome).join(', ') || 'Sem serviços',
          total: moeda(ordem.totalCentavos ?? 0),
        }));
      }}
      vazio="Nenhuma ordem de serviço encontrada."
      campos={[
        {
          chave: "descricao",
          titulo: "Descrição",
          placeholder: "Ex.: Revisão geral",
          validar: (valor) =>
            valor.trim().length < 2 ? "Informe pelo menos 2 caracteres." : undefined,
        },
        {
          chave: "data",
          titulo: "Data",
          placeholder: "Ex.: 2026-10-10",
          validar: (valor) =>
            !/^\d{4}-\d{2}-\d{2}$/.test(valor)
              ? "Informe uma data válida no formato YYYY-MM-DD."
              : undefined,
        },
        {
          chave: "veiculoId",
          titulo: "ID do veículo",
          placeholder: "Ex.: 64b7dfe3a8b9...",
          validar: (valor) =>
            valor.trim().length < 6 ? "Informe um identificador válido." : undefined,
        },
      ]}
      colunas={[
        { chave: "descricao", titulo: "Descrição" },
        { chave: "data", titulo: "Data" },
        { chave: "veiculo", titulo: "Veículo" },
        { chave: 'servicos', titulo: 'Serviços' },
        { chave: 'total', titulo: 'Total' },
      ]}
    />
  );
}
