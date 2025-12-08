import React, { useState, useEffect } from "react";
import "./agendamento.css";

import api from "../../../api/api.js";
import { logout } from "../../../utils/authUtils.js";

import axios from "axios";
import { Link } from "react-router-dom";
import {
  Home, Calendar, Wrench, Users, MessageSquare,
  FileText, Settings, Boxes, PawPrint
} from "lucide-react";

const Agendamento = () => {
  const [statusFiltro, setStatusFiltro] = useState("em_aprovacao");

  const [lista, setLista] = useState([]);
  const [popupData, setPopupData] = useState(null);

  const [confirmPopup, setConfirmPopup] = useState(null);
  const [denyPopup, setDenyPopup] = useState(null);
  const [cancelPopup, setCancelPopup] = useState(null);
  const [motivoTexto, setMotivoTexto] = useState("");

  const API = api.defaults.baseURL;

  // BUSCAR CONTRATOS
  useEffect(() => {
    carregarContratos();
  }, []);

  const carregarContratos = async () => {
    try {
      const response = await axios.get(`${API}/contrato`);

      const contratos = await Promise.all(
        response.data.map(async (c) => {
          const pets = await axios.get(`${API}/contrato/${c.id}/pet`);
          const servicos = await axios.get(`${API}/contrato/${c.id}/servico`);

          return {
            id: c.id,
            nome: c.nomeTutor || "Tutor",
            data: `${c.dataEntrada} - ${c.dataSaida}`,
            status: c.status,
            motivo: c.motivo || "",
            total: servicos.data.reduce((acc, s) => acc + (s.valor || 0), 0),
            pets: pets.data.map((p) => ({
              nome: p.nome,
              especie: p.especie,
              raca: p.raca,
              porte: p.porte,
              servicos: servicos.data.filter((s) => s.idPet === p.id)
            }))
          };
        })
      );

      setLista(contratos);
    } catch (err) {
      console.error("Erro ao carregar contratos:", err);
    }
  };

  // ALTERAR STATUS
  const atualizarStatus = async (id, status, motivo = "") => {
    try {
      await axios.put(`${API}/contrato/${id}/alterar-status`, { status, motivo });
      carregarContratos();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const confirmarAgendamento = async (id) => {
    await atualizarStatus(id, "aprovado");
    setConfirmPopup(null);
    setPopupData(null);
  };

  const negarAgendamento = async (id) => {
    if (!motivoTexto.trim()) return;
    await atualizarStatus(id, "negado", motivoTexto);
    setMotivoTexto("");
    setDenyPopup(null);
    setPopupData(null);
  };

  const cancelarAgendamento = async (id) => {
    if (!motivoTexto.trim()) return;
    await atualizarStatus(id, "cancelado", motivoTexto);
    setMotivoTexto("");
    setCancelPopup(null);
    setPopupData(null);
  };

  const filtrados = lista.filter(
    (item) => statusFiltro === "todos" || item.status === statusFiltro
  );

  const handleVerMais = (item) => {
    setPopupData(item);
  };

  const abrirConfirmar = (item) => setConfirmPopup(item);
  const abrirNegar = (item) => setDenyPopup(item);
  const abrirCancelar = (item) => setCancelPopup(item);

  return (
    <div className="container">
      {/* MENU LATERAL */}
      <aside className="sidebar">
        <h2 className="logo">PetFamily</h2>

        <nav className="menu">
          <Link className="menu-item" to="/home"><Home size={16} /> Início</Link>
          <Link className="menu-item active" to="/agendamento"><Calendar size={16} /> Agendamentos</Link>
          <Link className="menu-item" to="/servico"><Wrench size={16} /> Serviços</Link>
   {/*        <Link className="menu-item" to="/funcionario"><Users size={16} /> Funcionários</Link> */}
          <Link className="menu-item" to="/mensagens"><MessageSquare size={16} /> Mensagens</Link>
          <Link className="menu-item" to="/interacoes"><Boxes size={16} /> Interações</Link>
          <Link className="menu-item" to="/documentos"><FileText size={16} /> Documentos</Link>
          <Link className="menu-item" to="/configuracoes"><Settings size={16} /> Configurações</Link>
        </nav>

        <button className="logout" onClick={logout}>⟵ Sair</button>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
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
            <option value="cancelado">Cancelado</option>
            <option value="todos">Todos</option>
          </select>
        </div>

        <div className="lista-agendamentos">
          {filtrados.length === 0 && (
            <p style={{ opacity: 0.6 }}>Nenhum agendamento encontrado.</p>
          )}

          {filtrados.map((item) => (
            <div key={item.id} className="ag-card">
              <strong>{item.nome}</strong>
              <p>Data: {item.data}</p>

              <div className="actions">
                <button onClick={() => handleVerMais(item)}>Ver mais</button>

                {item.status === "em_aprovacao" && (
                  <>
                    <button className="button-confirmar" onClick={() => abrirConfirmar(item)}>
                      Confirmar
                    </button>
                    <button className="button-negar" onClick={() => abrirNegar(item)}>
                      Negar
                    </button>
                  </>
                )}

                {item.status === "aprovado" && (
                  <button className="button-negar" onClick={() => abrirCancelar(item)}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* POPUP DETALHES */}
      {popupData && (
        <div className="popup-overlay" onClick={() => setPopupData(null)}>
          <div className="popup popup-agendamento" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setPopupData(null)}>✖</button>

            <h2>PetFamily</h2>

            <div className="popup-header">
              <div>
                <h3>{popupData.nome}</h3>
                <p>{popupData.data}</p>
              </div>

              <strong className="popup-total">
                R$ {popupData.total.toFixed(2)}
              </strong>
            </div>

            <div className="popup-pets-list">
              {popupData.pets.map((pet, index) => (
                <div key={index} className="pet-box">
                  <div className="pet-info">
                    <h4><PawPrint size={16} /> {pet.nome}</h4>
                    <p>{pet.especie}</p>
                    <p>{pet.raca}</p>
                    <p>{pet.porte}</p>
                  </div>

                  <div className="pet-servicos">
                    <strong>
                      Serviços – R$ {
                        pet.servicos.reduce(
                          (acc, s) => acc + (s.valor || 0), 0
                        ).toFixed(2)
                      }
                    </strong>

                    {pet.servicos.map((s, i) => (
                      <p key={i}>
                        R$ {s.valor.toFixed(2)} — {s.nome}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {popupData.status === "em_aprovacao" && (
              <div className="popup-buttons">
                <button className="btn-confirmar" onClick={() => abrirConfirmar(popupData)}>
                  Confirmar
                </button>
                <button className="btn-negar" onClick={() => abrirNegar(popupData)}>
                  Negar
                </button>
              </div>
            )}

            {popupData.status === "aprovado" && (
              <div className="popup-buttons">
                <button className="btn-negar" onClick={() => abrirCancelar(popupData)}>
                  Cancelar agendamento
                </button>
              </div>
            )}

            {(popupData.status === "negado" || popupData.status === "cancelado") && (
              <button className="btn-ok" onClick={() => setPopupData(null)}>
                OK
              </button>
            )}
          </div>
        </div>
      )}

      {/* POPUP CONFIRMAR */}
      {confirmPopup && (
        <div className="popup-overlay" onClick={() => setConfirmPopup(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar hospedagem?</h3>
            <p>{confirmPopup.nome}</p>

            <div className="popup-buttons">
              <button className="btn-confirmar" onClick={() => confirmarAgendamento(confirmPopup.id)}>
                Confirmar
              </button>
              <button className="btn-negar" onClick={() => setConfirmPopup(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP NEGAR */}
      {denyPopup && (
        <div className="popup-overlay" onClick={() => setDenyPopup(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Negar hospedagem</h3>

            <textarea
              placeholder="Motivo da negação..."
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              style={{ width: "100%", height: "80px", borderRadius: "8px", padding: "8px" }}
            />

            <div className="popup-buttons">
              <button className="btn-negar" onClick={() => negarAgendamento(denyPopup.id)}>
                Negar
              </button>
              <button className="btn-ok" onClick={() => setDenyPopup(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP CANCELAR */}
      {cancelPopup && (
        <div className="popup-overlay" onClick={() => setCancelPopup(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Cancelar agendamento</h3>

            <textarea
              placeholder="Motivo do cancelamento..."
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              style={{ width: "100%", height: "80px", borderRadius: "8px", padding: "8px" }}
            />

            <div className="popup-buttons">
              <button className="btn-negar" onClick={() => cancelarAgendamento(cancelPopup.id)}>
                Cancelar agendamento
              </button>
              <button className="btn-ok" onClick={() => setCancelPopup(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Agendamento;
