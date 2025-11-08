import React, { useState } from "react";
import "./agendamento.css";
import { Link } from 'react-router-dom';

import { 
  Home, Calendar, Wrench, Users, MessageSquare, 
  FileText, Settings, Boxes 
} from "lucide-react";

const Agendamento = () => {
  const [statusFiltro, setStatusFiltro] = useState("em_aprovacao");
  const [popupData, setPopupData] = useState(null);

  // MOCK — substituir depois pela API
  const lista = [
    { id: 1, nome: "Maria Silva", data: "10/11/2025", status: "em_aprovacao" },
    { id: 2, nome: "João Pereira", data: "11/11/2025", status: "aprovado" },
    { id: 3, nome: "Carlos Souza", data: "12/11/2025", status: "negado" },
  ];

  const filtrados = lista.filter(
    (item) => statusFiltro === "todos" || item.status === statusFiltro
  );

  const handleVerMais = (item) => {
    setPopupData(item);
  };

  const handleConfirmar = (id) => {
    console.log("Confirmado:", id);
  };

  const handleNegar = (id) => {
    console.log("Negado:", id);
  };

  return (
    <div className="container">

      <aside className="sidebar">
        <h2 className="logo">PetFamily </h2>

        <nav className="menu">

          <Link className="menu-item" to='/home'>
            <Home size={16}/> Início
          </Link>

          <Link className="menu-item active" to="/agendamento">
            <Calendar size={16}/> Agendamentos
          </Link>

          <Link className="menu-item" to="/servico">
            <Wrench size={16}/> Serviços
          </Link>

          <Link className="menu-item" to="/funcionarios">
            <Users size={16}/> Funcionários
          </Link>

          <Link className="menu-item" to="/mensagens">
            <MessageSquare size={16}/> Mensagens
          </Link>

          <Link className="menu-item" to="/interacoes">
            <Boxes size={16}/> Interações
          </Link>

          <Link className="menu-item" to="/documentos">
            <FileText size={16}/> Documentos
          </Link>

          <Link className="menu-item" to="/configuracoes">
            <Settings size={16}/> Configurações
          </Link>
        </nav>

        <button className="logout">⟵ Sair</button>
      </aside>


      <main className="content">
        <h1>Agendamentos</h1>


        <div className="filter-box">
          <label>Status:</label>
          <select 
            value={statusFiltro} 
            onChange={(e) => setStatusFiltro(e.target.value)}
          >
            <option value="em_aprovacao">Em aprovação</option>
            <option value="aprovado">Aprovado</option>
            <option value="negado">Negado</option>
            <option value="todos">Todos</option>
          </select>
        </div>


        <div className="lista-agendamentos">
          {filtrados.map((item) => (
            <div key={item.id} className="ag-card">
              <strong>{item.nome}</strong>
              <p>Data: {item.data}</p>

              <div className="actions">
                <button onClick={() => handleVerMais(item)}>Ver mais</button>
                <button className="button-confirmar" onClick={() => handleConfirmar(item.id)}>Confirmar</button>
                <button className="button-negar" onClick={() => handleNegar(item.id)}>Negar</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {popupData && (
        <div className="popup-overlay" onClick={() => setPopupData(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Detalhes do agendamento</h3>
            <p>Nome: {popupData.nome}</p>
            <p>Data: {popupData.data}</p>
            <p>Status: {popupData.status}</p>

            <button onClick={() => setPopupData(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agendamento;
