import { Link } from "react-router-dom";
type Props = {
  grupo: string;
  titulo: string;
  descricao: string;
  novo?: { destino: string; texto: string };
};
export default function TituloPagina({
  grupo,
  titulo,
  descricao,
  novo,
}: Props) {
  return (
    <>
      <div className="breadcrumb">
        {grupo}
        <span aria-hidden="true">/</span>
        {titulo}
      </div>
      <div className="page-heading heading-actions">
        <div>
          <span className="eyebrow">GESTÃO DA OFICINA</span>
          <h1>{titulo}</h1>
          <p>{descricao}</p>
        </div>
        {novo && (
          <Link className="secondary-action" to={novo.destino}>
            {novo.texto} +
          </Link>
        )}
      </div>
    </>
  );
}
