import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import CadastroCliente from "./pages/CadastroCliente";
import NaoEncontrada from "./pages/NaoEncontrada";
import ConsultaClientes from "./pages/ConsultaClientes";
import CadastroVeiculo from "./pages/CadastroVeiculo";
import ConsultaVeiculos from "./pages/ConsultaVeiculos";
import CadastroOrdemServico from "./pages/CadastroOrdemServico";
import ConsultaOrdensServico from "./pages/ConsultaOrdensServico";
import CadastroServico from "./pages/CadastroServico";
import ServicosOrdem from "./pages/ServicosOrdem";
import Estoque from "./pages/Estoque";
import Orcamento from "./pages/Orcamento";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/ordens-servico" replace />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="orcamentos" element={<Orcamento />} />
          <Route path="clientes/novo" element={<CadastroCliente />} />
          <Route path="clientes" element={<ConsultaClientes />} />
          <Route path="veiculos/novo" element={<CadastroVeiculo />} />
          <Route path="veiculos" element={<ConsultaVeiculos />} />
          <Route path="ordens-servico/nova" element={<CadastroOrdemServico />} />
          <Route path="ordens-servico" element={<ConsultaOrdensServico />} />
          <Route path="ordens-servico/servicos" element={<ServicosOrdem />} />
          <Route path="servicos/novo" element={<CadastroServico />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
