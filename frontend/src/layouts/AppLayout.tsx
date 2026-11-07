import { NavLink, Outlet } from "react-router-dom";
import "./AppLayout.css";
import "../styles/Telas.css";
import "../styles/ERP.css";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="erp-sidebar">
        <NavLink className="erp-brand" to="/" aria-label="AutoHub — início"><img className="erp-original-logo" src="/autohub-logo.png" alt="AutoHub" /><span className="erp-brand-caption">GESTÃO DE OFICINAS</span></NavLink>
        <div className="erp-workspace"><span className="erp-workspace-icon">OF</span><div>Minha oficina<small>Ambiente de gestão</small></div></div>
        <nav className="app-nav" aria-label="Navegação principal">
          <span className="nav-section">RELACIONAMENTO</span>
          <NavLink to="/clientes/novo">Cadastrar cliente</NavLink>
          <NavLink to="/clientes" end>
            Consultar clientes
          </NavLink>
          <NavLink to="/veiculos/novo">Cadastrar veículos</NavLink>
          <NavLink to="/veiculos" end>
            Consultar veículos
          </NavLink>
          <span className="nav-section">OPERAÇÃO DA OFICINA</span>
          <NavLink to="/ordens-servico/nova">Cadastrar ordem</NavLink>
          <NavLink to="/ordens-servico" end>Consultar ordens</NavLink>
          <NavLink to="/servicos/novo">Cadastrar serviço</NavLink>
          <NavLink to="/ordens-servico/servicos">Serviços da ordem</NavLink>
          <NavLink to="/orcamentos">Orçamentos</NavLink>
          <span className="nav-section">MATERIAIS</span>
          <NavLink to="/estoque">Estoque de peças</NavLink>
        </nav>
        <div className="sidebar-bottom"><span className="erp-avatar">OP</span><div>Operação<small>Estação de trabalho</small></div></div>
      </aside>
      <div className="erp-content">
      <header className="erp-topbar"><span>Workspace <span className="topbar-divider">/</span> <strong>Gestão da oficina</strong></span><span className="erp-header-label">AUTOHUB ERP</span></header>
      <main id="main">
        <Outlet />
        <footer className="page-footer">
          AutoHub <span aria-hidden="true">·</span> Mais organização para sua
          oficina.
        </footer>
      </main>
      </div>
    </div>
  );
}
