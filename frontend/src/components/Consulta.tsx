import { useState } from "react";
  import type { FormEvent } from "react";
  import TituloPagina from "./TituloPagina";

  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  type Campo = {
    chave: string;
    titulo: string;
    placeholder: string;
    validar?: (valor: string) => string | undefined;
  };
  type Registro = { id: string; [campo: string]: string };
  type RespostaApi = { success: boolean; message?: string; data?: unknown[] };
  type Props = {
    grupo: string;
    titulo: string;
    descricao: string;
    novo: { destino: string; texto: string };
    campos: Campo[];
    colunas: { chave: string; titulo: string }[];
    endpoint: string;
    mapearRegistro: (registro: Record<string, unknown>) => Registro;
    vazio: string;
  };

  export default function Consulta({
    grupo,
    titulo,
    descricao,
    novo,
    campos,
    colunas,
    endpoint,
    mapearRegistro,
    vazio,
  }: Props) {
    const [filtros, setFiltros] = useState<Record<string, string>>({});
    const [erros, setErros] = useState<Record<string, string>>({});
    const [resultado, setResultado] = useState<Registro[] | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [erroApi, setErroApi] = useState("");

    async function buscar(parametros: URLSearchParams) {
      setCarregando(true);
      setErroApi("");
      try {
        const query = parametros.toString();
        const url = `${API_URL}${endpoint}${query ? `?${query}` : ""}`;
        const response = await fetch(url);
        const api = (await response.json()) as RespostaApi;
        if (!response.ok || !api.success) {
          throw new Error(api.message ?? "Não foi possível realizar a consulta.");
        }
        const registros = Array.isArray(api.data) ? api.data : [];
        setResultado(
          registros.map((registro) =>
            mapearRegistro(registro as Record<string, unknown>),
          ),
        );
      } catch (error) {
        setResultado(null);
        setErroApi(
          error instanceof TypeError
            ? "Não foi possível conectar à API. Verifique se o backend está em execução."
            : error instanceof Error
              ? error.message
              : "Não foi possível realizar a consulta.",
        );
      } finally {
        setCarregando(false);
      }
    }

    async function consultar(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const falhas: Record<string, string> = {};
      if (!Object.values(filtros).some((valor) => valor.trim())) {
        falhas.geral = "Preencha ao menos um campo ou escolha Mostrar todos.";
      }
      campos.forEach((campo) => {
        const valor = (filtros[campo.chave] || "").trim();
        if (valor) {
          const erro = campo.validar?.(valor);
          if (erro) falhas[campo.chave] = erro;
        }
      });
      setErros(falhas);
      if (Object.keys(falhas).length) {
        setResultado(null);
        setErroApi("");
        return;
      }

      const parametros = new URLSearchParams();
      campos.forEach((campo) => {
        const valor = filtros[campo.chave]?.trim();
        if (valor) parametros.set(campo.chave, valor);
      });
      await buscar(parametros);
    }

    async function mostrarTodos() {
      setFiltros({});
      setErros({});
      await buscar(new URLSearchParams());
    }

    return (
      <div className="tela-operacional">
        <TituloPagina
          grupo={grupo}
          titulo={titulo}
          descricao={descricao}
          novo={novo}
        />
        <section className="form-card" aria-label="Filtros de pesquisa">
          <div className="card-heading">
            <div>
              <h2>Pesquisar {grupo.toLowerCase()}</h2>
              <p>Preencha um ou mais campos. Os filtros são combinados.</p>
            </div>
          </div>
          <form onSubmit={consultar} noValidate>
            <div className="fields">
              {campos.map((campo, indice) => (
                <label
                  key={campo.chave}
                  className={indice === 0 ? "full" : ""}
                  htmlFor={campo.chave}
                >
                  {campo.titulo}
                  <input
                    id={campo.chave}
                    value={filtros[campo.chave] || ""}
                    placeholder={campo.placeholder}
                    maxLength={100}
                    aria-invalid={!!erros[campo.chave]}
                    aria-describedby={
                      erros[campo.chave] ? `${campo.chave}-erro` : undefined
                    }
                    onChange={(event) => {
                      setFiltros({ ...filtros, [campo.chave]: event.target.value });
                      setErros({});
                      setResultado(null);
                      setErroApi("");
                    }}
                  />
                  {erros[campo.chave] && (
                    <span className="field-error" id={`${campo.chave}-erro`}>
                      {erros[campo.chave]}
                    </span>
                  )}
                </label>
              ))}
            </div>
            {erros.geral && (
              <p role="alert" className="field-error error-summary">
                {erros.geral}
              </p>
            )}
            <div className="form-footer">
              <div className="consulta-actions">
                <button
                  className="clear-button"
                  type="button"
                  disabled={carregando}
                  onClick={() => {
                    setFiltros({});
                    setErros({});
                    setResultado(null);
                    setErroApi("");
                  }}
                >
                  Limpar filtros
                </button>
                <button
                  className="clear-button"
                  type="button"
                  disabled={carregando}
                  onClick={mostrarTodos}
                >
                  Mostrar todos
                </button>
              </div>
              <button type="submit" disabled={carregando}>
                {carregando ? "Consultando..." : "Consultar"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </section>
        <section
          className="results"
          aria-label="Resultados da consulta"
          aria-live="polite"
        >
          <h2>
            Resultados{" "}
            {resultado && <span className="result-count">{resultado.length}</span>}
          </h2>
          {erroApi ? (
            <p className="empty-state" role="alert">{erroApi}</p>
          ) : carregando ? (
            <p className="empty-state" role="status">Consultando registros...</p>
          ) : resultado === null ? (
            <p className="empty-state">
              Preencha os filtros e clique em Consultar, ou escolha Mostrar todos.
            </p>
          ) : resultado.length === 0 ? (
            <p className="empty-state">
              {vazio} Revise os filtros e tente novamente.
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <caption className="sr-only">{titulo} — resultados da API</caption>
                <thead>
                  <tr>
                    {colunas.map((coluna) => (
                      <th scope="col" key={coluna.chave}>
                        {coluna.titulo}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultado.map((registro) => (
                    <tr key={registro.id}>
                      {colunas.map((coluna) => (
                        <td key={coluna.chave}>{registro[coluna.chave]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  }
