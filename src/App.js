/* import HomeScreen from "./pages/hospedagens/home/home";
import RegistrationForm from "./pages/hospedagens/register/insert_basic_datas/insert_basic_datas"; */
import LoginScreen from "./pages/hospedagens/login/login";
import InsertBasicDatas from "./pages/hospedagens/register/insert_datas/insert_datas";
import InsertAddress from "./pages/hospedagens/register/insert_address/insert_address";
import HomePage from "./pages/hospedagens/home-page/home-page";
import Agendamento from "./pages/hospedagens/agendamento/agendamento";
import ServicoScreen from "./pages/hospedagens/servico/servico";
import FuncionarioScreen from "./pages/hospedagens/funcionario/funcionario";
import Documentos from "./pages/hospedagens/documentos/documentos";
import Mensagens from "./pages/hospedagens/mensagens/mensagens";
import Configuracoes from "./pages/hospedagens/configuracoes/configuracoes"; 
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import ConfirmDatas from "./pages/hospedagens/register/confirm_datas/confirm_datas";
import Avaliacoes from "./pages/hospedagens/avaliacoes/avaliacoes";

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<HomeScreen />} /> */}
          <Route path="/" element={<LoginScreen />} />

          {/* registrando hospedagem */}
          <Route path="/insert-basic-datas" element={<InsertBasicDatas />} />
          <Route path="/insert-address" element={<InsertAddress />} />
          <Route path="/confirm-datas" element={<ConfirmDatas />} />
          <Route path="/avaliacoes" element={<Avaliacoes />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/servico" element={<ServicoScreen />} />
          <Route path="/funcionario" element={<FuncionarioScreen />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/mensagens" element={<Mensagens />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
  