import { useState } from "react";
import Consulta from "../components/Consulta";
import { atualizarStatusOrdemServico, consultarOrdensServico, STATUS_ORDENS_SERVICO } from "../services/api";
import { moeda } from '../utils/moeda';

type LinhaOrdemServico = { id: string; [campo: string]: string };
type AtualizarLinha = (
  id: string,
  alteracoes: Record<string, string>,
) => void;

function EditorStatus({
  ordem,
  atualizarLinha,
}: {
  ordem: LinhaOrdemServico;
  atualizarLinha: AtualizarLinha;
}) {
  const [statusSelecionado, setStatusSelecionado] = useState(ordem.status ?? "");
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  const alterado = statusSelecionado !== ordem.status;

  async function salvar() {
    const status = STATUS_ORDENS_SERVICO.find(
      (opcao) => opcao.valor === statusSelecionado,
    )?.valor;
    if (!alterado || !status) return;

    setSalvando(true);
    setAviso(null);
    try {
      await atualizarStatusOrdemServico(ordem.id, status);
      atualizarLinha(ordem.id, { status });
      setAviso({ tipo: "success", texto: "Status salvo." });
    } catch (error) {
      setStatusSelecionado(ordem.status ?? "");
      setAviso({
        tipo: "error",
        texto: error instanceof Error ? error.message : "Não foi possível atualizar o status.",
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="status-cell">
      <select
        aria-label={`Status da ordem ${ordem.id}`}
        value={statusSelecionado}
        disabled={salvando}
        onChange={(event) => {
          const selecionado = STATUS_ORDENS_SERVICO.find(
            (status) => status.valor === event.currentTarget.value,
          );
          if (selecionado) {
            setStatusSelecionado(selecionado.valor);
            setAviso(null);
          }
        }}
      >
        {!ordem.status && (
          <option value="" disabled>
            Status não informado
          </option>
        )}
        {STATUS_ORDENS_SERVICO.map((status) => (
          <option key={status.valor} value={status.valor}>
            {status.rotulo}
          </option>
        ))}
        {ordem.status && !STATUS_ORDENS_SERVICO.some((status) => status.valor === ordem.status) && (
          <option value={ordem.status} disabled>Status legado: {ordem.status}</option>
        )}
      </select>
      {alterado && (
        <div className="status-actions">
          <button type="button" disabled={salvando} onClick={() => void salvar()}>
            {salvando ? "Salvando..." : "Confirmar"}
          </button>
          <button
            type="button"
            className="status-cancel"
            disabled={salvando}
            onClick={() => {
              setStatusSelecionado(ordem.status ?? "");
              setAviso(null);
            }}
          >
            Cancelar
          </button>
        </div>
      )}
      {aviso && (
        <span className={`status-feedback status-feedback-${aviso.tipo}`} role={aviso.tipo === "error" ? "alert" : "status"}>
          {aviso.texto}
        </span>
      )}
    </div>
  );
}

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
          status: ordem.status ?? '',
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
      renderizarCelula={(registro, chave, atualizarLinha) => {
        if (chave === "identificacao") {
          return <code className="os-identificacao">{registro.id}</code>;
        }
        if (chave !== "status") return registro[chave];
        return (
          <EditorStatus
            ordem={registro}
            atualizarLinha={atualizarLinha}
          />
        );
      }}
      colunas={[
        { chave: "identificacao", titulo: "Identificação da OS" },
        { chave: "descricao", titulo: "Descrição" },
        { chave: "data", titulo: "Data" },
        { chave: "veiculo", titulo: "Veículo" },
        { chave: 'servicos', titulo: 'Serviços' },
        { chave: 'status', titulo: 'Status' },
        { chave: 'total', titulo: 'Total' },
      ]}
    />
  );
}
