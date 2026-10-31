import { useState } from "react";
import Consulta from "../components/Consulta";
import {
  atualizarStatusOrdemServico,
  consultarOrdensServico,
  STATUS_ORDENS_SERVICO,
} from "../services/api";
import {
  converterDataBrasileiraParaIso,
  formatarDataBrasileira,
} from "../utils/date";

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
            Sem status registrado
          </option>
        )}
        {STATUS_ORDENS_SERVICO.map((status) => (
          <option key={status.valor} value={status.valor}>
            {status.rotulo}
          </option>
        ))}
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
          data: filtros.data
            ? converterDataBrasileiraParaIso(filtros.data) ?? filtros.data
            : undefined,
          veiculoId: filtros.veiculoId,
        });

        return ordens.map((ordem) => ({
          id: ordem._id,
          identificacao: ordem._id,
          descricao: ordem.descricao,
          data: formatarDataBrasileira(ordem.data),
          veiculo: ordem.veiculo ?? "Veículo não encontrado",
          status: ordem.status ?? "",
        }));
      }}
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
          placeholder: "DD/MM/AAAA",
          validar: (valor) => {
            return converterDataBrasileiraParaIso(valor)
              ? undefined
              : "Informe uma data existente no formato DD/MM/AAAA.";
          },
        },
        {
          chave: "veiculoId",
          titulo: "ID do veículo",
          placeholder: "ObjectId com 24 caracteres",
          validar: (valor) =>
            !/^[a-f\d]{24}$/i.test(valor.trim())
              ? "Informe um ID de veículo válido com 24 caracteres hexadecimais."
              : undefined,
        },
      ]}
      colunas={[
        { chave: "identificacao", titulo: "Identificação da OS" },
        { chave: "descricao", titulo: "Descrição" },
        { chave: "data", titulo: "Data" },
        { chave: "veiculo", titulo: "Veículo" },
        { chave: "status", titulo: "Status" },
      ]}
    />
  );
}
