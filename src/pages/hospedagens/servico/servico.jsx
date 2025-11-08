import React from "react";
import "./servico.css";
import { Link } from 'react-router-dom';
import { 
  Home, Calendar, Wrench, Users, MessageSquare, 
  FileText, Settings, Boxes 
} from "lucide-react";

const ServicoScreen = () => {

  return (
    <div className="container">
      <aside className="sidebar">
        <h2 className="logo">PetFamily </h2>

 <nav className="menu">
          <Link className="menu-item" to='/home'>
            <Home size={16}/> Início
          </Link>

          <Link className="menu-item" to="/agendamento">
            <Calendar size={16}/> Agendamentos
          </Link>

          <Link className="menu-item active" to="/servico">
            <Wrench size={16}/> Serviços
          </Link>

          <Link className="menu-item" to="/funcionario">
            <Users size={16}/> Funcionários
          </Link>

          <Link className="menu-item" to="/mensagem">
            <MessageSquare size={16}/> Mensagens
          </Link>

          <Link className="menu-item" to="/interacao">
            <Boxes size={16}/> Interações
          </Link>

          <Link className="menu-item" to="/documento">
            <FileText size={16}/> Documentos
          </Link>

          <Link className="menu-item" to="/configuracao">
            <Settings size={16}/> Configurações
          </Link>
        </nav>

        <button className="logout">⟵ Sair</button>
      </aside>

      <main className="content">
        <h1>Serviço</h1>
      </main>
    </div>
  );
};

export default ServicoScreen;