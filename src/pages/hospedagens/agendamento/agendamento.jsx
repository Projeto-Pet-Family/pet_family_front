import React from "react";
import "./agendamento.css";
import { 
  Home, Calendar, Wrench, Users, MessageSquare, 
  FileText, Settings, Boxes 
} from "lucide-react";

const Agendamento = () => {
  return (
    <div className="container">
      <aside className="sidebar">
        <h2 className="logo">PetFamily </h2>

        <nav className="menu">
          <a className="menu-item"><Home size={16}/> Início</a>
          <a className="menu-item active"><Calendar size={16}/> Agendamentos</a>
          <a className="menu-item"><Wrench size={16}/> Serviços</a>
          <a className="menu-item"><Users size={16}/> Funcionários</a>
          <a className="menu-item"><MessageSquare size={16}/> Mensagens</a>
          <a className="menu-item"><Boxes size={16}/> Interações</a>
          <a className="menu-item"><FileText size={16}/> Documentos</a>
          <a className="menu-item"><Settings size={16}/> Configurações</a>
        </nav>

        <button className="logout">⟵ Sair</button>
      </aside>

      <main className="content">
        <h1>Agendamentos</h1>
      </main>
    </div>
  );
};

export default Agendamento;