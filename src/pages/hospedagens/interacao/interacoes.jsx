import React, { useState } from "react";
import "./interacoes.css";
import { Link } from "react-router-dom";
import {
  Home,
  Calendar,
  Wrench,
  Users,
  MessageSquare,
  FileText,
  Settings,
  Boxes,
  Star
} from "lucide-react";

const Interacoes = () => {
  // MOCK DE AVALIAÇÕES
  const [avaliacoes, setAvaliacoes] = useState([
    {
      id: 1,
      tutor: "Maria Oliveira",
      pet: "Nina",
      nota: 5,
      comentario: "A hospedagem foi maravilhosa! A Nina voltou super feliz.",
      data: "18/11/2025",
      resposta: ""
    },
    {
      id: 2,
      tutor: "Carlos Souza",
      pet: "Thor",
      nota: 4,
      comentario: "Gostei bastante, mas o banho demorou um pouco mais que o esperado.",
      data: "10/11/2025",
      resposta: ""
    },
    {
      id: 3,
      tutor: "Letícia Santos",
      pet: "Milo",
      nota: 3,
      comentario: "Atendimento bom, mas poderia melhorar no tempo de retorno das mensagens.",
      data: "05/11/2025",
      resposta: ""
    }
  ]);

  // POPUP DE RESPOSTA
  const [responderPopup, setResponderPopup] = useState(null);
  const [respostaTexto, setRespostaTexto] = useState("");

  const abrirPopupResposta = (avaliacao) => {
    setResponderPopup(avaliacao);
    setRespostaTexto(avaliacao.resposta || "");
  };

  const salvarResposta = () => {
    setAvaliacoes((prev) =>
      prev.map((a) =>
        a.id === responderPopup.id ? { ...a, resposta: respostaTexto } : a
      )
    );
    setResponderPopup(null);
    setRespostaTexto("");
  };

  return (
    <div className="container">


      <aside className="sidebar">
        <h2 className="logo">PetFamily</h2>

        <nav className="menu">
          <Link className="menu-item" to="/home"><Home size={16}/> Início</Link>
          <Link className="menu-item" to="/agendamento"><Calendar size={16}/> Agendamentos</Link>
          <Link className="menu-item" to="/servico"><Wrench size={16}/> Serviços</Link>
          <Link className="menu-item" to="/funcionario"><Users size={16}/> Funcionários</Link>
          <Link className="menu-item" to="/mensagens"><MessageSquare size={16}/> Mensagens</Link>
          <Link className="menu-item active" to="/interacoes"><Boxes size={16}/> Interações</Link>
          <Link className="menu-item" to="/documentos"><FileText size={16}/> Documentos</Link>
          <Link className="menu-item" to="/configuracoes"><Settings size={16}/> Configurações</Link>
        </nav>

        <button className="logout">⟵ Sair</button>
      </aside>


      <main className="content">
        <h1>Avaliações</h1>

        <div className="avaliacoes-container">
          {avaliacoes.map((a) => (
            <div key={a.id} className="avaliacao-card">
              <div className="avaliacao-header">
                

                <div className="avaliacao-stars">
                  {Array.from({ length: a.nota }).map((_, i) => (
                    <Star key={i} size={18} fill="#ffc107" stroke="#ffc107"/>
                  ))}
                </div>

                <span className="avaliacao-data">{a.data}</span>
              </div>

              <p><strong>Tutor:</strong> {a.tutor}</p>
              <p><strong>Pet:</strong> {a.pet}</p>

              <p className="avaliacao-comentario">“{a.comentario}”</p>

              {a.resposta && (
                <div className="resposta-box">
                  <strong>Sua resposta:</strong>
                  <p>{a.resposta}</p>
                </div>
              )}

              <button className="btn-responder" onClick={() => abrirPopupResposta(a)}>
                Responder
              </button>
            </div>
          ))}
        </div>
      </main>


      {responderPopup && (
        <div className="popup-overlay" onClick={() => setResponderPopup(null)}>
          <div className="popup resposta-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Responder avaliação</h3>
            <p><strong>{responderPopup.tutor}</strong> — {responderPopup.pet}</p>

            <textarea
              placeholder="Digite sua resposta..."
              value={respostaTexto}
              onChange={(e) => setRespostaTexto(e.target.value)}
              style={{
                width: "100%",
                height: "90px",
                padding: "8px",
                borderRadius: "8px"
              }}
            />

            <div className="popup-buttons">
              <button className="btn-confirmar" onClick={salvarResposta}>
                Enviar Resposta
              </button>
              <button className="btn-negar" onClick={() => setResponderPopup(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Interacoes;
