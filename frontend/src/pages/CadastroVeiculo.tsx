import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import TituloPagina from "../components/TituloPagina";
import {
  cadastrarVeiculo,
  consultarClientes,
  type Cliente,
} from "../services/api";

type Aviso = {
  tipo: "success" | "error";
  mensagem: string;
};

export default function CadastroVeiculo() {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [erroClientes, setErroClientes] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarClientes() {
      try {
        const resultado = await consultarClientes({});
        if (ativo) setClientes(resultado);
      } catch (error) {
        if (ativo) {
          setErroClientes(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os clientes.",
          );
        }
      } finally {
        if (ativo) setCarregandoClientes(false);
      }
    }

    void carregarClientes();
    return () => {
      ativo = false;
    };
  }, []);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const dados = new FormData(form);
    const clienteId = String(dados.get("clienteId") ?? "");

    if (!clienteId || !clientes.some((cliente) => cliente._id === clienteId)) {
      setAviso({
        tipo: "error",
        mensagem: "Selecione um cliente válido para vincular ao veículo.",
      });
      return;
    }

    setEnviando(true);
    setAviso(null);

    try {
      await cadastrarVeiculo({
        placa: String(dados.get("placa") ?? "").trim(),
        marca: String(dados.get("marca") ?? "").trim(),
        modelo: String(dados.get("modelo") ?? "").trim(),
        ano: Number(dados.get("ano")),
        cor: String(dados.get("cor") ?? "").trim(),
        clienteId,
      });

      form.reset();
      setAviso({
        tipo: "success",
        mensagem: "Veículo cadastrado com sucesso.",
      });
    } catch (error) {
      setAviso({
        tipo: "error",
        mensagem:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar o veículo.",
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela-operacional">
      <TituloPagina
        grupo="Veículos"
        titulo="Novo veículo"
        descricao="Identifique o veículo e vincule-o ao cliente proprietário."
      />
      <section className="form-card" aria-labelledby="vehicle-title">
        <div className="card-heading">
          <div>
            <h2 id="vehicle-title">Dados do veículo</h2>
            <p>
              Todos os campos com <span className="required">*</span> são
              obrigatórios.
            </p>
          </div>
          <span className="section-number" aria-hidden="true">
            02
          </span>
        </div>
        <form onSubmit={cadastrar} onInput={() => setAviso(null)}>
          <div className="fields">
            <label className="full">
              Placa <span className="required">*</span>
              <input
                name="placa"
                placeholder="ABC1D23 ou ABC-1234"
                maxLength={8}
                pattern="[A-Za-z]{3}[- ]?[0-9][A-Za-z0-9][0-9]{2}"
                title="Informe uma placa antiga ou Mercosul."
                required
              />
            </label>
            <label>
              Marca <span className="required">*</span>
              <input
                name="marca"
                placeholder="Ex.: Volkswagen"
                maxLength={60}
                pattern=".*\S.*"
                required
              />
            </label>
            <label>
              Modelo <span className="required">*</span>
              <input
                name="modelo"
                placeholder="Ex.: Gol"
                maxLength={60}
                pattern=".*\S.*"
                required
              />
            </label>
            <label>
              Ano <span className="required">*</span>
              <input
                name="ano"
                type="number"
                min={1886}
                max={new Date().getFullYear() + 1}
                step={1}
                placeholder="Ex.: 2020"
                required
              />
            </label>
            <label>
              Cor <span className="required">*</span>
              <input
                name="cor"
                placeholder="Ex.: Prata"
                maxLength={40}
                pattern=".*\S.*"
                required
              />
            </label>
            <label className="full address">
              Cliente proprietário <span className="required">*</span>
              <select
                name="clienteId"
                defaultValue=""
                required
                disabled={carregandoClientes || clientes.length === 0}
              >
                <option value="" disabled>
                  {carregandoClientes
                    ? "Carregando clientes..."
                    : clientes.length === 0
                      ? "Nenhum cliente disponível"
                      : "Selecione o proprietário"}
                </option>
                {clientes.map((cliente) => (
                  <option key={cliente._id} value={cliente._id}>
                    {cliente.nomeCompleto} - {cliente.cpf}
                  </option>
                ))}
              </select>
              {erroClientes ? (
                <span className="field-error" role="alert">
                  {erroClientes}
                </span>
              ) : clientes.length === 0 && !carregandoClientes ? (
                <span className="field-hint">
                  Cadastre um cliente antes de cadastrar um veículo.
                </span>
              ) : (
                <span className="field-hint">
                  O veículo precisa estar vinculado a um cliente existente.
                </span>
              )}
            </label>
          </div>
          <div className="form-footer">
            <span>Confira a placa e o proprietário antes de continuar.</span>
            <button
              type="submit"
              disabled={enviando || carregandoClientes || clientes.length === 0}
            >
              {enviando ? "Salvando..." : "Cadastrar"}{" "}
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
