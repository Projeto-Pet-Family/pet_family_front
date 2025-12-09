import React, { useState, useEffect } from "react";
import "./agendamento.css";
import api from "../../../api/api.js";
import { logout, getIdHospedagem } from "../../../utils/authUtils.js";
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

  // BUSCAR CONTRATOS
  useEffect(() => {
    carregarContratos();
  }, []);

  const carregarContratos = async () => {
    try {
      const response = await api.get(`/contrato/ler-contrato-hospedagem/${getIdHospedagem()}`);

      
      console.log('Resposta da API:', response.data);
      
      // A API retorna { success, count, data }
      if (!response.data.success || !response.data.data) {
        console.error('Resposta da API inválida:', response.data);
        setLista([]);
        return;
      }
      
      const contratosArray = response.data.data;
      
      // Mapear os dados para o formato esperado pelo componente
      const contratos = contratosArray.map((c) => {
        return {
          id: c.id,
          nome: c.usuario?.nome || "Tutor",
          data: `${new Date(c.datas.inicio).toLocaleDateString()} - ${new Date(c.datas.fim).toLocaleDateString()}`,
          dataInicio: c.datas.inicio,
          dataFim: c.datas.fim,
          status: c.status?.contrato || "em_aprovacao",
          motivo: c.motivo || "",
          total: c.calculos?.valorTotal || 0,
          hospedagem: c.hospedagem?.nome || "",
          pets: c.pets?.map((p) => ({
            id: p.idpet,
            nome: p.nome,
            especie: p.especie_id === 1 ? "Cachorro" : 
                     p.especie_id === 2 ? "Gato" : 
                     p.especie_id === 3 ? "Pássaro" : "Outro",
            raca: p.raca_id ? `Raça ${p.raca_id}` : "Não especificada",
            porte: p.porte_id === 1 ? "Pequeno" : 
                   p.porte_id === 2 ? "Médio" : "Grande",
            sexo: p.sexo === "M" ? "Macho" : "Fêmea",
            servicos: p.servicos?.map((s) => ({
              id: s.idservico,
              nome: s.descricao,
              valor: s.preco_total || s.preco_unitario || 0,
              quantidade: s.quantidade || 1
            })) || []
          })) || [],
          servicosGerais: c.servicosGerais || [],
          calculos: c.calculos || {},
          formatado: c.formatado || {}
        };
      });
      
      console.log('Contratos processados:', contratos);
      setLista(contratos);
      
    } catch (err) {
      console.error("Erro ao carregar contratos:", err);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      }
      setLista([]);
    }
  };

  // ALTERAR STATUS - AJUSTAR PARA SUA API
  const atualizarStatus = async (id, status, motivo = "") => {
    try {
      // Ajuste o endpoint conforme sua API
      await api.put(`/contrato/${id}/status`, { 
        status_contrato: status,
        motivo: motivo 
      });
      carregarContratos();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      }
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
              <p>Hospedagem: {item.hospedagem}</p>
              <p>Data: {item.data}</p>
              <p>Valor: R$ {item.total.toFixed(2)}</p>
              <p>Status: {item.status === "em_aprovacao" ? "Em aprovação" : 
                         item.status === "aprovado" ? "Aprovado" : 
                         item.status === "negado" ? "Negado" : "Cancelado"}</p>

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
                <p>Hospedagem: {popupData.hospedagem}</p>
                <p>{popupData.data}</p>
              </div>

              <div>
                <strong className="popup-total">
                  R$ {popupData.total.toFixed(2)}
                </strong>
                <p>Status: {popupData.status === "em_aprovacao" ? "Em aprovação" : 
                           popupData.status === "aprovado" ? "Aprovado" : 
                           popupData.status === "negado" ? "Negado" : "Cancelado"}</p>
              </div>
            </div>

            <div className="popup-details">
              <div className="detail-item">
                <strong>Período:</strong> {popupData.formatado.periodo || "Não especificado"}
              </div>
              <div className="detail-item">
                <strong>Quantidade de Pets:</strong> {popupData.calculos.quantidadePets || 0}
              </div>
              <div className="detail-item">
                <strong>Valor Hospedagem:</strong> R$ {popupData.calculos.valorHospedagem?.toFixed(2) || "0,00"}
              </div>
              <div className="detail-item">
                <strong>Valor Serviços:</strong> R$ {popupData.calculos.valorServicos?.toFixed(2) || "0,00"}
              </div>
            </div>

            <div className="popup-pets-list">
              {popupData.pets.map((pet, index) => (
                <div key={index} className="pet-box">
                  <div className="pet-info">
                    <h4><PawPrint size={16} /> {pet.nome}</h4>
                    <p><strong>Espécie:</strong> {pet.especie}</p>
                    <p><strong>Raça:</strong> {pet.raca}</p>
                    <p><strong>Porte:</strong> {pet.porte}</p>
                    <p><strong>Sexo:</strong> {pet.sexo}</p>
                  </div>

                  <div className="pet-servicos">
                    <strong>
                      Serviços – R$ {
                        pet.servicos.reduce(
                          (acc, s) => acc + (s.valor || 0), 0
                        ).toFixed(2)
                      }
                    </strong>

                    {pet.servicos.length > 0 ? (
                      pet.servicos.map((s, i) => (
                        <p key={i}>
                          R$ {s.valor.toFixed(2)} — {s.nome} {s.quantidade > 1 ? `(x${s.quantidade})` : ''}
                        </p>
                      ))
                    ) : (
                      <p>Nenhum serviço selecionado</p>
                    )}
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
            <p><strong>{confirmPopup.nome}</strong></p>
            <p>{confirmPopup.hospedagem}</p>
            <p>{confirmPopup.data}</p>
            <p><strong>Valor: R$ {confirmPopup.total.toFixed(2)}</strong></p>

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
            <p><strong>{denyPopup.nome}</strong></p>

            <textarea
              placeholder="Motivo da negação..."
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              style={{ width: "100%", height: "80px", borderRadius: "8px", padding: "8px", margin: "10px 0" }}
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
            <p><strong>{cancelPopup.nome}</strong></p>

            <textarea
              placeholder="Motivo do cancelamento..."
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              style={{ width: "100%", height: "80px", borderRadius: "8px", padding: "8px", margin: "10px 0" }}
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