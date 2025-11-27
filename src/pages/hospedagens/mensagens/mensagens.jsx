import React, { useState } from "react";
import "./mensagens.css";
import { Link } from 'react-router-dom';
import { Home, Calendar, Wrench, Users, MessageSquare, FileText, Settings, Boxes } from "lucide-react";

const Mensagens = () => {

  // Lista de conversas (você poderá puxar isso da API depois)
  const conversas = [
    {
      id: 1,
      nome: "Ana Souza",
      preview: "Oi, tenho uma dúvida sobre a hospedagem...",
      mensagens: [
        { autor: "cliente", texto: "Oi, tenho uma dúvida sobre a hospedagem." },
        { autor: "voce", texto: "Claro! Como posso ajudar?" },
      ]
    },
    {
      id: 2,
      nome: "Carlos Lima",
      preview: "Meu pet tem alergia, posso levar ração?",
      mensagens: [
        { autor: "cliente", texto: "Meu pet tem alergia, posso levar ração?" }
      ]
    },
    {
      id: 3,
      nome: "Joana Martins",
      preview: "Queria saber os horários disponíveis :)",
      mensagens: [
        { autor: "cliente", texto: "Queria saber os horários disponíveis :)" }
      ]
    }
  ];

  // Estado da conversa selecionada
  const [selecionada, setSelecionada] = useState(null);

  return (
    <div className="container">
      <aside className="sidebar">
        <h2 className="logo">PetFamily</h2>

        <nav className="menu">
          <Link className="menu-item" to="/home"><Home size={16}/> Início</Link>
          <Link className="menu-item" to="/agendamento"><Calendar size={16}/> Agendamentos</Link>
          <Link className="menu-item" to="/servico"><Wrench size={16}/> Serviços</Link>
          <Link className="menu-item" to="/funcionario"><Users size={16}/> Funcionários</Link>
          <Link className="menu-item active" to="/mensagens"><MessageSquare size={16}/> Mensagens</Link>
          <Link className="menu-item" to="/interacoes"><Boxes size={16}/> Interações</Link>
          <Link className="menu-item" to="/documentos"><FileText size={16}/> Documentos</Link>
          <Link className="menu-item" to="/configuracoes"><Settings size={16}/> Configurações</Link>
        </nav>

        <button className="logout">⟵ Sair</button>
      </aside>

      <main className="content">
        <h1>Mensagens</h1>

        <div className="message-layout">


          <div className="chat-list">
            {conversas.map((c) => (
              <div 
                key={c.id}
                className={`chat-item ${selecionada?.id === c.id ? "active-chat" : ""}`}
                onClick={() => setSelecionada(c)}
              >
                <strong>{c.nome}</strong>
                <p>{c.preview}</p>
              </div>
            ))}
          </div>


          <div className="chat-window">

            <div className="chat-header">
              {selecionada ? (
                <strong>{selecionada.nome}</strong>
              ) : (
                <strong>Selecione uma conversa</strong>
              )}
            </div>

  
            <div className="chat-body">
              {selecionada ? (
                selecionada.mensagens.map((m, index) => (
                  <p 
                    key={index} 
                    className={m.autor === "voce" ? "msg-voce" : "msg-cliente"}
                  >
                    {m.texto}
                  </p>
                ))
              ) : (
                <p className="system-msg">Nenhuma conversa aberta.</p>
              )}
            </div>

            <div className="chat-input-area">
              <input 
                type="text" 
                placeholder="Digite uma mensagem..." 
                disabled={!selecionada}
              />
              <button disabled={!selecionada}>Enviar</button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Mensagens;
