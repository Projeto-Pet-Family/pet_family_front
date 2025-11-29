import React, { useState } from "react";
import "./agendamento.css";

import { Link } from 'react-router-dom';
import { 
  Home, Calendar, Wrench, Users, MessageSquare, 
  FileText, Settings, Boxes, PawPrint 
} from "lucide-react";

const Agendamento = () => {
  const [statusFiltro, setStatusFiltro] = useState("em_aprovacao");

  const [popupData, setPopupData] = useState(null);

  const [confirmPopup, setConfirmPopup] = useState(null);
  const [denyPopup, setDenyPopup] = useState(null);

  const [cancelPopup, setCancelPopup] = useState(null);
  const [motivoTexto, setMotivoTexto] = useState("");

  // LISTA SIMULATION
  const [lista, setLista] = useState([
    {
      id: 1,
      nome: "Tutor 1 da Silva",
      data: "25/07 - 30/07",
      status: "em_aprovacao",
      total: 200,
      pets: [
        {
          nome: "Nana",
          especie: "Cachorro",
          raca: "Border Collie",
          porte: "Médio",
          servicos: [
            { nome: "Passeio", valor: 20 },
            { nome: "Banho", valor: 30 }
          ]
        },
        {
          nome: "Tico Tico",
          especie: "Gato",
          raca: "Siames",
          porte: "Pequeno",
          servicos: [
            { nome: "Hospedagem", valor: 150 }
          ]
        }
      ]
    },
    {
      id: 2,
      nome: "Carlos Mendes",
      data: "14/12/2025",
      status: "aprovado",
      total: 120,
      pets: []
    },
    {
      id: 3,
      nome: "Fernanda Silva",
      data: "10/12/2025",
      status: "negado",
      total: 75,
      pets: [],
      motivo: "Sem disponibilidade"
    }
  ]);

  const filtrados = lista.filter(
    (item) => statusFiltro === "todos" || item.status === statusFiltro
  );

  const handleVerMais = (item) => {
    setPopupData(item);
  };

  const abrirConfirmar = (item) => setConfirmPopup(item);

  const confirmarAgendamento = (id) => {
    setLista((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "aprovado" } : item
      )
    );

    setConfirmPopup(null);
    setPopupData(null);
  };


  const abrirNegar = (item) => setDenyPopup(item);

  const negarAgendamento = (id) => {
    if (!motivoTexto.trim()) return;

    setLista((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "negado", motivo: motivoTexto }
          : item
      )
    );

    setMotivoTexto("");
    setDenyPopup(null);
    setPopupData(null);
  };


  const abrirCancelar = (item) => setCancelPopup(item);

  const cancelarAgendamento = (id) => {
    if (!motivoTexto.trim()) return;

    setLista((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "cancelado", motivo: motivoTexto }
          : item
      )
    );

    setMotivoTexto("");
    setCancelPopup(null);
    setPopupData(null);
  };

  return (
    <div className="container">

      <aside className="sidebar">
        <h2 className="logo">PetFamily</h2>

        <nav className="menu">
          <Link className="menu-item" to='/home'><Home size={16}/> Início</Link>
          <Link className="menu-item active" to="/agendamento"><Calendar size={16}/> Agendamentos</Link>
          <Link className="menu-item" to="/servico"><Wrench size={16}/> Serviços</Link>
          <Link className="menu-item" to="/funcionario"><Users size={16}/> Funcionários</Link>
          <Link className="menu-item" to="/mensagens"><MessageSquare size={16}/> Mensagens</Link>
          <Link className="menu-item" to="/interacoes"><Boxes size={16}/> Interações</Link>
          <Link className="menu-item" to="/documentos"><FileText size={16}/> Documentos</Link>
          <Link className="menu-item" to="/configuracoes"><Settings size={16}/> Configurações</Link>
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
            <option value="cancelado">Cancelado</option>
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

                {item.status === "em_aprovacao" && (
                  <>
                    <button 
                      className="button-confirmar" 
                      onClick={() => abrirConfirmar(item)}
                    >
                      Confirmar
                    </button>

                    <button 
                      className="button-negar" 
                      onClick={() => abrirNegar(item)}
                    >
                      Negar
                    </button>
                  </>
                )}

                {item.status === "aprovado" && (
                  <button 
                    className="button-negar" 
                    onClick={() => abrirCancelar(item)}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>



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

              <strong className="popup-total">R$ {popupData.total},00</strong>
            </div>

            <div className="popup-pets-list">
              {popupData.pets.map((pet, index) => (
                <div key={index} className="pet-box">
                  <div className="pet-info">
                    <h4><PawPrint size={16}/> {pet.nome}</h4>
                    <p>{pet.especie}</p>
                    <p>{pet.raca}</p>
                    <p>{pet.porte}</p>
                  </div>

                  <div className="pet-servicos">
                    <strong>
                      Serviços - R$ {pet.servicos.reduce((acc, s) => acc + s.valor, 0)}
                    </strong>

                    {pet.servicos.map((s, i) => (
                      <p key={i}>R$ {s.valor},00 — {s.nome}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {popupData.status === "em_aprovacao" && (
              <div className="popup-buttons">
                <button className="btn-confirmar" onClick={() => abrirConfirmar(popupData)}>Confirmar</button>
                <button className="btn-negar"     onClick={() => abrirNegar(popupData)}>Negar</button>
              </div>
            )}

            {popupData.status === "aprovado" && (
              <div className="popup-buttons">
                <button className="btn-negar" onClick={() => abrirCancelar(popupData)}>
                  Cancelar agendamento
                </button>
              </div>
            )}

            {popupData.status !== "em_aprovacao" && popupData.status !== "aprovado" && (
              <button className="btn-ok" onClick={() => setPopupData(null)}>OK</button>
            )}

          </div>
        </div>
      )}



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




      {denyPopup && (
        <div className="popup-overlay" onClick={() => setDenyPopup(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Negar hospedagem</h3>

            <textarea
              placeholder="Motivo da negação..."
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              style={{
                width: "100%",
                height: "80px",
                borderRadius: "8px",
                padding: "8px"
              }}
            />

            <div className="popup-buttons">
              <button 
                className="btn-negar" 
                onClick={() => negarAgendamento(denyPopup.id)}
              >
                Negar
              </button>

              <button 
                className="btn-ok" 
                onClick={() => setDenyPopup(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}




      {cancelPopup && (
        <div className="popup-overlay" onClick={() => setCancelPopup(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Cancelar agendamento</h3>

            <textarea
              placeholder="Motivo do cancelamento..."
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              style={{
                width: "100%",
                height: "80px",
                borderRadius: "8px",
                padding: "8px"
              }}
            />

            <div className="popup-buttons">
              <button 
                className="btn-negar" 
                onClick={() => cancelarAgendamento(cancelPopup.id)}
              >
                Cancelar agendamento
              </button>

              <button 
                className="btn-ok" 
                onClick={() => setCancelPopup(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Agendamento;
