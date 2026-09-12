import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import CadastroCliente from "./pages/CadastroCliente";
import NaoEncontrada from "./pages/NaoEncontrada";
import ConsultaClientes from "./pages/ConsultaClientes";
import CadastroVeiculo from "./pages/CadastroVeiculo";
import ConsultaVeiculos from "./pages/ConsultaVeiculos";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/clientes/novo" replace />} />
          <Route path="clientes/novo" element={<CadastroCliente />} />
          <Route path="clientes" element={<ConsultaClientes />} />
          <Route path="veiculos/novo" element={<CadastroVeiculo />} />
          <Route path="veiculos" element={<ConsultaVeiculos />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
