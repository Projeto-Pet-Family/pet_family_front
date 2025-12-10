import React, { useState, useEffect } from "react";
import "./avaliacoes.css";
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

import api from "../../../api/api";
import { getIdHospedagem, logout } from "../../../utils/authUtils";

const Avaliacoes = () => {
  const idHospedagem = getIdHospedagem();

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // POPUP DE RESPOSTA
  const [responderPopup, setResponderPopup] = useState(null);
  const [respostaTexto, setRespostaTexto] = useState("");


  // CARREGAR AVALIAÇÕES

  const carregarAvaliacoes = async () => {
    try {
      const response = await api.get(`/avaliacao/hospedagem/${idHospedagem}`);

      console.log("RETORNO API AVALIAÇÕES:", response.data);

      const lista = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.dados)
        ? response.data.dados
        : [];

      setAvaliacoes(lista);
    } catch (err) {
      console.error("Erro ao carregar avaliações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAvaliacoes();
  }, []);

  // ABRIR POPUP DE RESPOSTA
  const abrirPopupResposta = (avaliacao) => {
    setResponderPopup(avaliacao);
    setRespostaTexto(avaliacao.resposta || "");
  };

  // SALVAR RESPOSTA 
  const salvarResposta = async () => {
    if (!respostaTexto.trim()) return;

    try {
      await api.put(`/avaliacao/${responderPopup.id}`, {
        ...responderPopup,
        resposta: respostaTexto
      });

      // recarregar lista
      await carregarAvaliacoes();

      // fechar popup
      setResponderPopup(null);
      setRespostaTexto("");
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    }
  };

  // RENDERIZAÇÃO
  return (
    <div className="container">
      <aside className="sidebar">
        <h2 className="logo">PetFamily</h2>

        <nav className="menu">
          <Link className="menu-item" to="/home"><Home size={16} /> Início</Link>
          <Link className="menu-item" to="/agendamento"><Calendar size={16} /> Agendamentos</Link>
          <Link className="menu-item" to="/servico"><Wrench size={16} /> Serviços</Link>
{/*           <Link className="menu-item" to="/funcionario"><Users size={16} /> Funcionários</Link> */}
          <Link className="menu-item" to="/mensagens"><MessageSquare size={16} /> Mensagens</Link>
          <Link className="menu-item active" to="/interacoes"><Boxes size={16} /> Avaliações</Link>
          <Link className="menu-item" to="/documentos"><FileText size={16} /> Documentos</Link>
          <Link className="menu-item" to="/configuracoes"><Settings size={16} /> Configurações</Link>
        </nav>

        <button className="logout" onClick={logout}>⟵ Sair</button>
      </aside>

      <main className="content">
        <h1>Avaliações</h1>

        {loading ? (
          <p>Carregando avaliações...</p>
        ) : (
          <div className="avaliacoes-container">
            {avaliacoes.length === 0 && (
              <p className="system-msg">Nenhuma avaliação encontrada.</p>
            )}

            {avaliacoes.map((a) => (
              <div key={a.id} className="avaliacao-card">

                <div className="avaliacao-header">
                  <div className="avaliacao-stars">
                    {Array.from({ length: a.nota }).map((_, i) => (
                      <Star key={i} size={18} fill="#ffc107" stroke="#ffc107" />
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
        )}
      </main>

      {/* POPUP */}
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

export default Avaliacoes;
