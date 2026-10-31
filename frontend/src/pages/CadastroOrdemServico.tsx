import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import TituloPagina from "../components/TituloPagina";
import {
  cadastrarOrdemServico,
  consultarVeiculos,
  type Veiculo,
} from "../services/api";
import {
  dataLocalHoje,
} from "../utils/date";

type Aviso = {
  tipo: "success" | "error";
  mensagem: string;
};

export default function CadastroOrdemServico() {
  const hoje = dataLocalHoje();
  const [dataOrdem, setDataOrdem] = useState(hoje);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregandoVeiculos, setCarregandoVeiculos] = useState(true);
  const [erroBusca, setErroBusca] = useState("");
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarVeiculos() {
      try {
        const resultado = await consultarVeiculos();
        if (ativo) setVeiculos(resultado);
      } catch (error) {
        if (ativo) {
          setErroBusca(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os veículos.",
          );
        }
      } finally {
        if (ativo) setCarregandoVeiculos(false);
      }
    }

    void carregarVeiculos();
    return () => {
      ativo = false;
    };
  }, []);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const dados = new FormData(form);
    const veiculoId = String(dados.get("veiculoId") ?? "");
    const data = String(dados.get("data") ?? "");

    if (!veiculoId || !veiculos.some((veiculo) => veiculo._id === veiculoId)) {
      setAviso({
        tipo: "error",
        mensagem:
          veiculos.length === 0
            ? "Cadastre um veículo antes de criar uma ordem de serviço."
            : "Selecione um veículo cadastrado para continuar.",
      });
      return;
    }

    if (!data || data < dataLocalHoje()) {
      setAviso({
        tipo: "error",
        mensagem:
          "Informe uma data válida no formato DD/MM/AAAA, igual ou posterior a hoje.",
      });
      return;
    }

    setSalvando(true);
    setAviso(null);

    try {
      await cadastrarOrdemServico({
        descricao: String(dados.get("descricao") ?? "").trim(),
        data,
        veiculoId,
      });

      form.reset();
      setDataOrdem(dataLocalHoje());
      setAviso({
        tipo: "success",
        mensagem: "Ordem de serviço cadastrada com sucesso.",
      });
    } catch (error) {
      setAviso({
        tipo: "error",
        mensagem:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar a ordem de serviço.",
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="tela-operacional">
      <TituloPagina
        grupo="Ordens de serviço"
        titulo="Nova ordem de serviço"
        descricao="Registre os serviços solicitados e vincule-os a um veículo cadastrado."
      />
      <section className="form-card" aria-labelledby="order-title">
        <div className="card-heading">
          <div>
            <h2 id="order-title">Dados da ordem</h2>
            <p>Selecione o veículo primeiro e informe a data e os serviços.</p>
          </div>
          <span className="section-number" aria-hidden="true">
            03
          </span>
        </div>
        <form onSubmit={cadastrar} onInput={() => setAviso(null)}>
          <div className="fields">
            <label>
              Veículo <span className="required">*</span>
              <select
                name="veiculoId"
                defaultValue=""
                required
                disabled={carregandoVeiculos || veiculos.length === 0}
              >
                <option value="" disabled>
                  {carregandoVeiculos
                    ? "Carregando veículos..."
                    : veiculos.length === 0
                      ? "Nenhum veículo disponível"
                      : "Selecione o veículo"}
                </option>
                {veiculos.map((veiculo) => (
                  <option key={veiculo._id} value={veiculo._id}>
                    {veiculo.placa} - {veiculo.marca} {veiculo.modelo} -{" "}
                    {veiculo.cliente ?? "Cliente não encontrado"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Data da ordem <span className="required">*</span>
              <input
                name="data"
                type="date"
                lang="pt-BR"
                value={dataOrdem}
                min={hoje}
                onChange={(event) => setDataOrdem(event.currentTarget.value)}
                required
              />
              <span className="field-hint">
                Selecione hoje ou uma data futura no calendário.
              </span>
            </label>
            <label className="full">
              Descrição dos serviços <span className="required">*</span>
              <textarea
                name="descricao"
                rows={4}
                maxLength={1000}
                placeholder="Descreva os serviços solicitados"
                required
              />
            </label>
            {erroBusca && (
              <p className="field-error full" role="alert">
                {erroBusca}
              </p>
            )}
            {!carregandoVeiculos && !erroBusca && veiculos.length === 0 && (
              <p className="field-hint full">
                Cadastre um veículo antes de criar uma ordem de serviço.
              </p>
            )}
          </div>
          <div className="form-footer">
            <span>
              A ordem só será salva quando estiver vinculada a um veículo
              existente.
            </span>
            <button type="submit" disabled={salvando || carregandoVeiculos}>
              {salvando ? "Salvando..." : "Criar ordem"}{" "}
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
      </section>
    </div>
  );
}
