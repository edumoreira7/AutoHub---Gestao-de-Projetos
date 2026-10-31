import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import TituloPagina from "../components/TituloPagina";
import {
  adicionarServicoAOrdem,
  consultarOrdensServico,
  consultarServicos,
  type OrdemServico,
  type Servico,
} from "../services/api";

type Aviso = { tipo: "success" | "error"; mensagem: string };

function moeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export default function AdicionarServicoOrdem() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [ordemId, setOrdemId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroCarga, setErroCarga] = useState("");
  const [aviso, setAviso] = useState<Aviso | null>(null);

  async function carregarDados() {
    try {
      const [ordensCarregadas, servicosCarregados] = await Promise.all([
        consultarOrdensServico(),
        consultarServicos(true),
      ]);
      setOrdens(ordensCarregadas);
      setServicos(servicosCarregados);
    } catch (error) {
      setErroCarga(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar ordens e serviços.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    let ativo = true;
    Promise.all([consultarOrdensServico(), consultarServicos(true)])
      .then(([ordensCarregadas, servicosCarregados]) => {
        if (!ativo) return;
        setOrdens(ordensCarregadas);
        setServicos(servicosCarregados);
      })
      .catch((error: unknown) => {
        if (!ativo) return;
        setErroCarga(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar ordens e serviços.",
        );
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const ordemSelecionada = ordens.find((ordem) => ordem._id === ordemId);
  const servicosDisponiveis = useMemo(
    () =>
      servicos.filter(
        (servico) =>
          !ordemSelecionada?.servicos.some(
            (item) => item.servicoId === servico._id,
          ),
      ),
    [ordemSelecionada, servicos],
  );

  async function adicionar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ordemSelecionada) {
      setAviso({ tipo: "error", mensagem: "Selecione uma ordem de serviço." });
      return;
    }
    if (!servicosDisponiveis.some((servico) => servico._id === servicoId)) {
      setAviso({
        tipo: "error",
        mensagem: "Selecione um serviço ativo ainda não adicionado a esta ordem.",
      });
      return;
    }

    setSalvando(true);
    setAviso(null);
    try {
      const resposta = await adicionarServicoAOrdem(ordemSelecionada._id, servicoId);
      const ordemAtualizada = resposta.data;
      if (!ordemAtualizada) {
        throw new Error("A API não retornou o total atualizado da ordem.");
      }

      setOrdens((atuais) =>
        atuais.map((ordem) =>
          ordem._id === ordemSelecionada._id
            ? {
                ...ordem,
                servicos: ordemAtualizada.servicos,
                valorTotal: ordemAtualizada.valorTotal,
              }
            : ordem,
        ),
      );
      setServicoId("");
      setAviso({
        tipo: "success",
        mensagem: "Serviço adicionado. O total da ordem foi atualizado.",
      });
    } catch (error) {
      setAviso({
        tipo: "error",
        mensagem:
          error instanceof Error
            ? error.message
            : "Não foi possível adicionar o serviço à ordem.",
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="tela-operacional">
      <TituloPagina
        grupo="Ordens de serviço"
        titulo="Adicionar serviço à ordem"
        descricao="Associe um serviço ativo a uma ordem existente."
      />
      <section className="form-card" aria-labelledby="add-service-title">
        <div className="card-heading">
          <div>
            <h2 id="add-service-title">Serviço da ordem</h2>
            <p>Escolha uma ordem e um serviço cadastrado e ativo.</p>
          </div>
          <span className="section-number" aria-hidden="true">
            09
          </span>
        </div>
        {carregando ? (
          <p className="service-state" role="status">
            Carregando ordens e serviços...
          </p>
        ) : erroCarga ? (
          <div className="service-state">
            <p className="field-error" role="alert">{erroCarga}</p>
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setCarregando(true);
                setErroCarga("");
                void carregarDados();
              }}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <form onSubmit={adicionar} onInput={() => setAviso(null)}>
            <div className="fields">
              <label className="full">
                Ordem de serviço <span className="required">*</span>
                <select
                  value={ordemId}
                  onChange={(event) => {
                    setOrdemId(event.currentTarget.value);
                    setServicoId("");
                    setAviso(null);
                  }}
                  required
                >
                  <option value="">Selecione uma ordem</option>
                  {ordens.map((ordem) => (
                    <option key={ordem._id} value={ordem._id}>
                      {ordem._id} · {ordem.descricao} · {ordem.veiculo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full">
                Serviço ativo <span className="required">*</span>
                <select
                  value={servicoId}
                  onChange={(event) => setServicoId(event.currentTarget.value)}
                  disabled={!ordemSelecionada || servicosDisponiveis.length === 0}
                  required
                >
                  <option value="">
                    {!ordemSelecionada
                      ? "Selecione uma ordem primeiro"
                      : servicosDisponiveis.length === 0
                        ? "Nenhum serviço ativo disponível para esta ordem"
                        : "Selecione um serviço"}
                  </option>
                  {servicosDisponiveis.map((servico) => (
                    <option key={servico._id} value={servico._id}>
                      {servico.nome} · {moeda(servico.precoPadrao)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {ordemSelecionada && (
              <section className="order-service-summary" aria-label="Resumo da ordem">
                <h3>Serviços já associados</h3>
                {ordemSelecionada.servicos.length === 0 ? (
                  <p className="field-hint">Nenhum serviço adicionado ainda.</p>
                ) : (
                  <ul>
                    {ordemSelecionada.servicos.map((item) => (
                      <li key={item.servicoId}>
                        <span>{item.nome}</span>
                        <span>{moeda(item.preco)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="order-service-total">
                  Total da ordem: <strong>{moeda(ordemSelecionada.valorTotal)}</strong>
                </p>
              </section>
            )}

            {ordens.length === 0 && (
              <p className="field-hint fields-message">
                Cadastre uma ordem de serviço antes de associar serviços.
              </p>
            )}
            {servicos.length === 0 && (
              <p className="field-hint fields-message">
                Não há serviços ativos. Cadastre um serviço ativo primeiro.
              </p>
            )}

            <div className="form-footer">
              <span>O preço e o total são obtidos e calculados pela API.</span>
              <button
                type="submit"
                disabled={
                  salvando ||
                  !ordemSelecionada ||
                  !servicoId ||
                  servicosDisponiveis.length === 0
                }
              >
                {salvando ? "Adicionando..." : "Adicionar serviço"}{" "}
                <span aria-hidden="true">→</span>
              </button>
            </div>
            {aviso && (
              <p
                className={`notice notice-${aviso.tipo}`}
                role={aviso.tipo === "error" ? "alert" : "status"}
              >
                {aviso.mensagem}
              </p>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
