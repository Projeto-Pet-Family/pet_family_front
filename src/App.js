import HomeScreen from "./pages/hospedagens/home/home";
import RegistrationForm from "./pages/hospedagens/register/register";
import LoginScreen from "./pages/hospedagens/login/login";
import HomePage from "./pages/hospedagens/home-page/home-page";
import Agendamento from "./pages/hospedagens/agendamento/agendamento";
import ServicoScreen from "./pages/hospedagens/servico/servico";
import FuncionarioScreen from "./pages/hospedagens/funcionario/funcionario";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/servico" element={<ServicoScreen />} />
          <Route path="/funcionario" element={<FuncionarioScreen />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
