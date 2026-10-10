import { useState } from "react";
import type { FormEvent } from "react";
import TituloPagina from "./TituloPagina";
type Campo = {
  chave: string;
  titulo: string;
  placeholder: string;
  validar?: (valor: string) => string | undefined;
};
type Registro = { id: string; [campo: string]: string };
type Props = {
  grupo: string;
  titulo: string;
  descricao: string;
  novo: { destino: string; texto: string };
  campos: Campo[];
  colunas: { chave: string; titulo: string }[];
  registros?: Registro[];
  buscar?: (filtros: Record<string, string>) => Promise<Registro[]>;
  vazio: string;
};
export default function Consulta({
  grupo,
  titulo,
  descricao,
  novo,
  campos,
  colunas,
  registros = [],
  buscar,
  vazio,
}: Props) {
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [erros, setErros] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<Registro[] | null>(null);
  const [erroConsulta, setErroConsulta] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function consultar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const falhas: Record<string, string> = {};
    if (!Object.values(filtros).some((valor) => valor.trim()))
      falhas.geral = "Preencha ao menos um campo para consultar.";
    campos.forEach((campo) => {
      const valor = (filtros[campo.chave] || "").trim();
      if (valor) {
        const erro = campo.validar?.(valor);
        if (erro) falhas[campo.chave] = erro;
      }
    });
    setErros(falhas);
    setErroConsulta("");
    if (Object.keys(falhas).length) {
      setResultado(null);
      return;
    }
    setCarregando(true);

    try {
      if (buscar) {
        setResultado(await buscar(filtros));
        return;
      }

      const normalizar = (s: string) =>
        s
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
      setResultado(
        registros.filter((registro) =>
          campos.every((campo) =>
            normalizar(registro[campo.chave]).includes(
              normalizar(filtros[campo.chave] || ""),
            ),
          ),
        ),
      );
    } catch (error) {
      setResultado(null);
      setErroConsulta(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar a consulta.",
      );
    } finally {
      setCarregando(false);
    }
  }
  return (
    <div className="tela-operacional">
      <TituloPagina
        grupo={grupo}
        titulo={titulo}
        descricao={descricao}
        novo={novo}
      />
      {!buscar && (
        <p className="demo-label">
          Demonstração com dados fictícios · consulta ao banco ainda não
          conectada.
        </p>
      )}
      <section className="form-card" aria-label="Filtros de pesquisa">
        <div className="card-heading">
          <div>
            <h2>Pesquisar {grupo.toLowerCase()}</h2>
            <p>Preencha um ou mais campos. Os filtros são combinados.</p>
          </div>
        </div>
        <form onSubmit={consultar} noValidate>
          <div className="fields">
            {campos.map((campo, i) => (
              <label
                key={campo.chave}
                className={i === 0 ? "full" : ""}
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
                    setFiltros({
                      ...filtros,
                      [campo.chave]: event.target.value,
                    });
                    setErros({});
                    setErroConsulta("");
                    setResultado(null);
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
            <button
              className="clear-button"
              type="button"
              onClick={() => {
                setFiltros({});
                setErros({});
                setErroConsulta("");
                setResultado(null);
              }}
            >
              Limpar filtros
            </button>
            <button
              type="button"
              className="clear-button"
              disabled={carregando}
              onClick={async () => {
                setErros({});
                setErroConsulta("");
                setFiltros({});
                setCarregando(true);
                try {
                  if (buscar) {
                    setResultado(await buscar({}));
                    return;
                  }

                  setResultado(registros);
                } catch (error) {
                  setResultado(null);
                  setErroConsulta(
                    error instanceof Error
                      ? error.message
                      : "Não foi possível carregar todos os registros.",
                  );
                } finally {
                  setCarregando(false);
                }
              }}
            >
              Mostrar todos
            </button>
            <button type="submit" disabled={carregando}>
              {carregando ? "Consultando..." : "Consultar"}{" "}
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
          {resultado && (
            <span className="result-count">{resultado.length}</span>
          )}
        </h2>
        {erroConsulta ? (
          <p className="empty-state result-error" role="alert">
            {erroConsulta}
          </p>
        ) : resultado === null ? (
          <p className="empty-state">
            Preencha os filtros e clique em Consultar para ver os resultados.
          </p>
        ) : resultado.length === 0 ? (
          <p className="empty-state">
            {vazio} Revise os filtros e tente novamente.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <caption className="sr-only">{titulo}</caption>
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
