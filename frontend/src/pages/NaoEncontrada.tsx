import { Link } from "react-router-dom";
export default function NaoEncontrada() {
  return (
    <section className="page-heading">
      <h1>Página não encontrada</h1>
      <p>Este endereço não existe.</p>
      <Link to="/clientes/novo">Ir para o cadastro de clientes</Link>
    </section>
  );
}
