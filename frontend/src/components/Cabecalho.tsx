import { Link } from "react-router-dom";
export default function Cabecalho() {
  return (
    <header className="topbar">
      <Link className="brand" to="/clientes/novo" aria-label="AutoHub — início">
        <img className="brand-logo" src="/autohub-logo.png" alt="" />
        <span className="brand-name">
          AUTO<strong>HUB</strong>
        </span>
      </Link>
      <span className="workspace-label">Gestão da oficina</span>
    </header>
  );
}
