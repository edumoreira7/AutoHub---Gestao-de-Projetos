import { useState } from "react";
import type { FormEvent } from "react";
import { cadastrarCliente } from "../services/api";
import "./CadastroCliente.css";

type Notice = {
  type: "success" | "error";
  message: string;
};

export default function CadastroCliente() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setNotice(null);
    setIsSubmitting(true);

    try {
      await cadastrarCliente({
        nomeCompleto: String(formData.get("nomeCompleto") ?? "").trim(),
        cpf: String(formData.get("cpf") ?? "").replace(/\D/g, ""),
        telefone: String(formData.get("telefone") ?? "").replace(/\D/g, ""),
        email: String(formData.get("email") ?? "").trim().toLowerCase(),
        endereco: String(formData.get("endereco") ?? "").trim() || undefined,
      });

      form.reset();
      setNotice({
        type: "success",
        message: "Cliente cadastrado com sucesso.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar o cliente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="cadastro-cliente">
      <div className="breadcrumb">
        Clientes <span aria-hidden="true">/</span> Novo cadastro
      </div>
      <div className="page-heading">
        <span className="eyebrow">RELACIONAMENTO COM O CLIENTE</span>
        <h1>Novo cliente</h1>
        <p>
          Comece pelo essencial. Cadastre os dados de quem confia na sua
          oficina.
        </p>
      </div>
      <section className="form-card" aria-labelledby="form-title">
        <div className="card-heading">
          <div>
            <h2 id="form-title">Dados do cliente</h2>
            <p>
              Campos com <span className="required">*</span> são obrigatórios.
            </p>
          </div>
          <span className="section-number" aria-hidden="true">
            01
          </span>
        </div>
        <form onSubmit={handleSubmit} onInput={() => setNotice(null)}>
          <div className="fields">
            <label className="full">
              Nome completo <span className="required">*</span>
              <input
                name="nomeCompleto"
                autoComplete="name"
                placeholder="Digite o nome completo"
                required
              />
            </label>
            <label>
              CPF <span className="required">*</span>
              <input
                name="cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                required
              />
            </label>
            <label>
              Telefone <span className="required">*</span>
              <input
                name="telefone"
                type="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                required
              />
            </label>
            <label className="full">
              E-mail <span className="required">*</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nome@exemplo.com"
                required
              />
            </label>
            <label className="full address">
              Endereço <span className="optional">Opcional</span>
              <input
                name="endereco"
                autoComplete="street-address"
                placeholder="Rua, número, bairro e cidade"
              />
            </label>
          </div>
          <div className="form-footer">
            <span>Confira os dados antes de continuar.</span>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}{" "}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          {notice && (
            <p
              className={`notice notice-${notice.type}`}
              role={notice.type === "error" ? "alert" : "status"}
            >
              {notice.message}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
