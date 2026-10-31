import { useState } from "react";
import type { FormEvent } from "react";
import TituloPagina from "../components/TituloPagina";
import { cadastrarServico } from "../services/api";

type Aviso = {
  tipo: "success" | "error";
  mensagem: string;
};

export default function CadastroServico() {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const dados = new FormData(form);
    const nome = String(dados.get("nome") ?? "").trim();
    const precoPadrao = Number(dados.get("precoPadrao"));

    if (!nome) {
      setAviso({ tipo: "error", mensagem: "Informe o nome do serviço." });
      return;
    }
    if (!Number.isFinite(precoPadrao) || precoPadrao <= 0) {
      setAviso({
        tipo: "error",
        mensagem: "O preço padrão deve ser um valor numérico maior que zero.",
      });
      return;
    }
    if (Math.abs(Math.round(precoPadrao * 100) - precoPadrao * 100) >= 1e-8) {
      setAviso({
        tipo: "error",
        mensagem: "Informe o preço com no máximo duas casas decimais.",
      });
      return;
    }

    setSalvando(true);
    setAviso(null);
    try {
      await cadastrarServico({
        nome,
        precoPadrao,
        ativo: dados.get("ativo") === "on",
      });
      form.reset();
      setAviso({ tipo: "success", mensagem: "Serviço cadastrado com sucesso." });
    } catch (error) {
      setAviso({
        tipo: "error",
        mensagem:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar o serviço.",
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="tela-operacional">
      <TituloPagina
        grupo="Serviços"
        titulo="Cadastrar serviço"
        descricao="Cadastre os serviços oferecidos pela oficina e seus preços padrão."
      />
      <section className="form-card" aria-labelledby="service-title">
        <div className="card-heading">
          <div>
            <h2 id="service-title">Dados do serviço</h2>
            <p>Informe o nome, o preço padrão e se o serviço está ativo.</p>
          </div>
          <span className="section-number" aria-hidden="true">
            08
          </span>
        </div>
        <form onSubmit={cadastrar} onInput={() => setAviso(null)}>
          <div className="fields">
            <label className="full">
              Nome do serviço <span className="required">*</span>
              <input
                name="nome"
                maxLength={120}
                placeholder="Ex.: Troca de óleo"
                required
              />
            </label>
            <label>
              Preço padrão (R$) <span className="required">*</span>
              <input
                name="precoPadrao"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex.: 150,00"
                required
              />
            </label>
            <label className="service-active-field">
              <input name="ativo" type="checkbox" defaultChecked />
              Serviço ativo e disponível para novas ordens
            </label>
          </div>
          <div className="form-footer">
            <span>O preço deve ser maior que zero e ter até duas casas decimais.</span>
            <button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Cadastrar serviço"}{" "}
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
