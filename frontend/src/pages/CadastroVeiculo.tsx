import { useState } from "react";
import type { FormEvent } from "react";
import TituloPagina from "../components/TituloPagina";
import { clientesDemo } from "../data/demonstracao";
export default function CadastroVeiculo() {
  const [aviso, setAviso] = useState("");
  function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAviso(
      "O envio do cadastro ainda não está disponível. Nenhum veículo foi salvo.",
    );
  }
  return (
    <div className="tela-operacional">
      <TituloPagina
        grupo="Veículos"
        titulo="Novo veículo"
        descricao="Identifique o veículo e vincule-o ao cliente proprietário."
      />
      <p className="demo-label">
        Demonstração · os proprietários disponíveis são fictícios.
      </p>
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
        <form onSubmit={cadastrar} onInput={() => setAviso("")}>
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
              <select name="clienteId" defaultValue="" required>
                <option value="" disabled>
                  Selecione o proprietário
                </option>
                {clientesDemo.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} — {cliente.cpf}
                  </option>
                ))}
              </select>
              <span className="field-hint">
                O veículo precisa estar vinculado a um cliente.
              </span>
            </label>
          </div>
          <div className="form-footer">
            <span>Confira a placa e o proprietário antes de continuar.</span>
            <button type="submit">
              Cadastrar <span aria-hidden="true">→</span>
            </button>
          </div>
          {aviso && (
            <p className="notice" role="status">
              {aviso}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
