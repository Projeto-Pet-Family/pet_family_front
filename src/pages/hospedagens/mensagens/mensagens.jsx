import "./mensagens.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Home, Calendar, Wrench, Users, MessageSquare,
  FileText, Settings, Boxes
} from "lucide-react";

import api from "../../../api/api.js";
import { getIdHospedagem, logout } from "../../../utils/authUtils";

const Mensagens = () => {

  const idHospedagem = getIdHospedagem();

  const [conversas, setConversas] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [mensagemTexto, setMensagemTexto] = useState("");

  // ==============================
  // BUSCAR LISTA DE CONVERSAS
  // ==============================
  const carregarConversas = async () => {
    try {
      const response = await api.get(`/mensagem/web/conversas/${idHospedagem}`);

      console.log("RETORNO DA API LISTA DE CONVERSAS:", response.data);

      if (Array.isArray(response.data)) {
        setConversas(response.data);
      } else if (Array.isArray(response.data?.dados)) {
        setConversas(response.data.dados);
      } else {
        console.error("A API não retornou um array!");
        setConversas([]);
      }

    } catch (err) {
      console.error("Erro ao carregar conversas:", err);
    }
  };

  useEffect(() => {
    carregarConversas();
  }, []);

  // ==============================
  // ABRIR CONVERSA / BUSCAR MENSAGENS
  // ==============================
  const abrirConversa = async (user) => {
    try {
      const response = await api.get(`/mensagem/web/conversa/${idHospedagem}/${user.id}`);

      console.log("RETORNO DA API MENSAGENS:", response.data);

      const msgs = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.dados)
          ? response.data.dados
          : [];

      setSelecionada({
        id: user.id,
        nome: user.nome,
        mensagens: msgs
      });

      // marcar mensagens como lidas
      msgs.forEach((m) => {
        if (!m.lida && m.autor === "cliente") {
          api.put(`/mensagem/${m.id}/ler`);
        }
      });

    } catch (err) {
      console.error("Erro ao abrir conversa:", err);
    }
  };

  // ==============================
  // ENVIAR MENSAGEM
  // ==============================
  const enviarMensagem = async () => {
    if (!mensagemTexto.trim() || !selecionada) return;

    try {
      await api.post("/mensagem/web", {
        idhospedagem: idHospedagem,
        idusuario: selecionada.id,
        texto: mensagemTexto
      });

      // recarregar conversa atual (CORRIGIDO)
      await abrirConversa({ id: selecionada.id, nome: selecionada.nome });

      // recarregar lista de conversas
      await carregarConversas();

      // limpar input
      setMensagemTexto("");

    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <h2 className="logo">PetFamily</h2>

        <nav className="menu">
          <Link className="menu-item" to="/home"><Home size={16} /> Início</Link>
          <Link className="menu-item" to="/agendamento"><Calendar size={16} /> Agendamentos</Link>
          <Link className="menu-item" to="/servico"><Wrench size={16} /> Serviços</Link>
          <Link className="menu-item" to="/funcionario"><Users size={16} /> Funcionários</Link>
          <Link className="menu-item active" to="/mensagens"><MessageSquare size={16} /> Mensagens</Link>
          <Link className="menu-item" to="/interacoes"><Boxes size={16} /> Interações</Link>
          <Link className="menu-item" to="/documentos"><FileText size={16} /> Documentos</Link>
          <Link className="menu-item" to="/configuracoes"><Settings size={16} /> Configurações</Link>
        </nav>

        <button className="logout" onClick={logout}>⟵ Sair</button>
      </aside>

      <main className="content">
        <h1>Mensagens</h1>

        <div className="message-layout">

          {/* LISTA DE CONVERSAS */}
          <div className="chat-list">
            {conversas.length === 0 && (
              <p className="system-msg">Nenhuma conversa encontrada.</p>
            )}

            {Array.isArray(conversas) && conversas.map((c) => (
              <div
                key={c.idusuario}
                className={`chat-item ${selecionada?.id === c.idusuario ? "active-chat" : ""}`}
                onClick={() => abrirConversa({ id: c.idusuario, nome: c.nome })}
              >
                <strong>{c.nome}</strong>
                <p>{c.ultimaMensagem}</p>

                {c.naoLidas > 0 && (
                  <span className="badge-nao-lidas">{c.naoLidas}</span>
                )}
              </div>
            ))}
          </div>

          {/* JANELA DE CHAT */}
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
                    className={m.autor === "hospedagem" ? "msg-voce" : "msg-cliente"}
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
                value={mensagemTexto}
                onChange={(e) => setMensagemTexto(e.target.value)}
                disabled={!selecionada}
              />
              <button onClick={enviarMensagem} disabled={!selecionada}>
                Enviar
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Mensagens;
