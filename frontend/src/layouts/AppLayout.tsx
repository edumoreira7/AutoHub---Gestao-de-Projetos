import { NavLink, Outlet } from "react-router-dom";
import Cabecalho from "../components/Cabecalho";
import "./AppLayout.css";
import "../styles/Telas.css";
export default function AppLayout() {
  return (
    <div className="app-shell">
      <Cabecalho />
      <main id="main">
        <nav className="app-nav" aria-label="Navegação principal">
          <NavLink to="/clientes/novo">Cadastrar cliente</NavLink>
          <NavLink to="/clientes" end>
            Consultar clientes
          </NavLink>
          <NavLink to="/veiculos/novo">Cadastrar veículos</NavLink>
          <NavLink to="/veiculos" end>
            Consultar veículos
          </NavLink>
        </nav>
        <Outlet />
        <footer className="page-footer">
          AutoHub <span aria-hidden="true">·</span> Mais organização para sua
          oficina.
        </footer>
      </main>
    </div>
  );
}
