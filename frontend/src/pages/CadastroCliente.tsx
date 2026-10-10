import { useState } from "react";
import type { FormEvent } from "react";
import "./CadastroCliente.css";

export default function CadastroCliente() {
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    setNotice("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/clientes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData.entries())),
        },
      );
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Não foi possível cadastrar o cliente.");
      }
      setNotice(result.message ?? "Cliente cadastrado com sucesso.");
      form.reset();
    } catch (error) {
      setNotice(
        error instanceof TypeError
          ? "Não foi possível conectar à API. Verifique se o backend está em execução."
          : error instanceof Error
            ? error.message
            : "Não foi possível cadastrar o cliente. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
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
        <form onSubmit={handleSubmit} onInput={() => setNotice("")}>
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
                type="text"
                inputMode="numeric"
                placeholder="00000000000 ou 000.000.000-00"
                minLength={11}
                maxLength={14}
                pattern="(?:[0-9]{11}|[0-9]{3}[.][0-9]{3}[.][0-9]{3}-[0-9]{2})"
                title="Informe um CPF com exatamente 11 números, sem letras."
                required
              />
            </label>
            <label>
              Telefone <span className="required">*</span>
              <input
                name="telefone"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                placeholder="11999990000 ou (11) 99999-0000"
                minLength={11}
                maxLength={15}
                pattern="(?:[0-9]{11}|[(][0-9]{2}[)] ?[0-9]{5}-[0-9]{4})"
                title="Informe um telefone brasileiro com DDD e 11 números, sem letras."
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
            <button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Cadastrar"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
