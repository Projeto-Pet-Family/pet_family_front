import React, { useState, useEffect } from "react";
import "./agendamento.css";
import api from "../../../api/api.js";
import { logout, getIdHospedagem } from "../../../utils/authUtils.js";
import { Link } from "react-router-dom";
import {
  Home, Calendar, Wrench, Users, MessageSquare,
  FileText, Settings, Boxes, PawPrint,
  CheckCircle, XCircle, Clock, Ban, Play, CheckSquare
} from "lucide-react";

const Agendamento = () => {
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [lista, setLista] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(null);
  const [denyPopup, setDenyPopup] = useState(null);
  const [cancelPopup, setCancelPopup] = useState(null);
  const [motivoTexto, setMotivoTexto] = useState("");
  const [transicoesPermitidas, setTransicoesPermitidas] = useState({});
  const [loading, setLoading] = useState(false);

  // Mapeamento de status para ícones e cores
  const statusConfig = {
    em_aprovacao: { 
      label: "Em aprovação", 
      icon: <Clock size={14} />, 
      color: "#FFA500",
      bgColor: "#FFF7E6"
    },
    aprovado: { 
      label: "Aprovado", 
      icon: <CheckCircle size={14} />, 
      color: "#28a745",
      bgColor: "#E8F5E9"
    },
    negado: { 
      label: "Negado", 
      icon: <XCircle size={14} />, 
      color: "#dc3545",
      bgColor: "#FDE8E8"
    },
    cancelado: { 
      label: "Cancelado", 
      icon: <Ban size={14} />, 
      color: "#6c757d",
      bgColor: "#F2F2F2"
    },
    em_execucao: { 
      label: "Em execução", 
      icon: <Play size={14} />, 
      color: "#007bff",
      bgColor: "#E3F2FD"
    },
    concluido: { 
      label: "Concluído", 
      icon: <CheckSquare size={14} />, 
      color: "#17a2b8",
      bgColor: "#E8F6F8"
    }
  };

  // BUSCAR CONTRATOS
  useEffect(() => {
    carregarContratos();
  }, []);

  const carregarContratos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contrato/ler-contrato-hospedagem/${getIdHospedagem()}`);
      
      console.log('Resposta da API:', response.data);
      
      if (!response.data.success || !response.data.data) {
        console.error('Resposta da API inválida:', response.data);
        setLista([]);
        return;
      }
      
      const contratosArray = response.data.data;
      
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
      
      // Carregar transições permitidas para cada contrato
      await carregarTransicoesPermitidas(contratos);
      
    } catch (err) {
      console.error("Erro ao carregar contratos:", err);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      }
      setLista([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar transições de status permitidas para cada contrato
  const carregarTransicoesPermitidas = async (contratos) => {
    try {
      const transicoes = {};
      
      for (const contrato of contratos) {
        try {
          const response = await api.get(`/contrato/${contrato.id}/transicoes-status`);
          if (response.data && response.data.transicoesPermitidas) {
            transicoes[contrato.id] = response.data.transicoesPermitidas;
          }
        } catch (error) {
          console.error(`Erro ao carregar transições para contrato ${contrato.id}:`, error);
          // Define transições padrão baseadas no status atual
          transicoes[contrato.id] = getTransicoesPadrao(contrato.status);
        }
      }
      
      setTransicoesPermitidas(transicoes);
    } catch (error) {
      console.error("Erro ao carregar transições:", error);
    }
  };

  // Transições padrão caso a API falhe
  const getTransicoesPadrao = (statusAtual) => {
    const transicoesPadrao = {
      'em_aprovacao': ['aprovado', 'negado'],
      'aprovado': ['em_execucao', 'cancelado'],
      'em_execucao': ['concluido', 'cancelado'],
      'concluido': [],
      'negado': [],
      'cancelado': []
    };
    return transicoesPadrao[statusAtual] || [];
  };

  // Obter texto do botão baseado no status de destino
  const getTextoBotaoStatus = (status) => {
    const textos = {
      'aprovado': { text: 'Aprovar', icon: <CheckCircle size={14} />, className: 'button-confirmar' },
      'negado': { text: 'Negar', icon: <XCircle size={14} />, className: 'button-negar' },
      'cancelado': { text: 'Cancelar', icon: <Ban size={14} />, className: 'button-negar' },
      'em_execucao': { text: 'Iniciar Execução', icon: <Play size={14} />, className: 'button-executar' },
      'concluido': { text: 'Concluir', icon: <CheckSquare size={14} />, className: 'button-concluir' }
    };
    return textos[status] || { text: status, icon: null, className: 'button-default' };
  };

  // Alterar status do contrato
  const alterarStatusContrato = async (idContrato, novoStatus, motivo = "") => {
    try {
      setLoading(true);
      
      const payload = { 
        status: novoStatus
      };
      
      // Adiciona motivo apenas para negação e cancelamento
      if (novoStatus === 'negado' || novoStatus === 'cancelado') {
        payload.motivo = motivo || "Sem motivo especificado";
      }
      
      console.log(`Alterando status do contrato ${idContrato} para ${novoStatus}`, payload);
      
      // Usa a nova rota para alterar status
      const response = await api.put(`/contrato/${idContrato}/alterar-status`, payload);
      
      if (response.data && response.data.message) {
        console.log("Status alterado com sucesso:", response.data.message);
      }
      
      // Recarrega os contratos
      await carregarContratos();
      
      // Fecha os popups
      setConfirmPopup(null);
      setDenyPopup(null);
      setCancelPopup(null);
      setPopupData(null);
      setMotivoTexto("");
      
      return true;
      
    } catch (err) {
      console.error("Erro ao alterar status do contrato:", err);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
        
        // Mostra mensagem de erro específica do backend
        if (err.response.data && err.response.data.message) {
          alert(`Erro: ${err.response.data.message}`);
        }
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status (método legado - mantido para compatibilidade)
  const atualizarStatus = async (id, status, motivo = "") => {
    return await alterarStatusContrato(id, status, motivo);
  };

  // Handlers para os botões de status
  const handleAprovar = async (id) => {
    await alterarStatusContrato(id, 'aprovado');
  };

  const handleNegar = async (id, motivo) => {
    if (!motivo || motivo.trim() === "") {
      alert("Por favor, informe o motivo da negação.");
      return false;
    }
    await alterarStatusContrato(id, 'negado', motivo);
  };

  const handleCancelar = async (id, motivo) => {
    if (!motivo || motivo.trim() === "") {
      alert("Por favor, informe o motivo do cancelamento.");
      return false;
    }
    await alterarStatusContrato(id, 'cancelado', motivo);
  };

  const handleIniciarExecucao = async (id) => {
    await alterarStatusContrato(id, 'em_execucao');
  };

  const handleConcluir = async (id) => {
    await alterarStatusContrato(id, 'concluido');
  };

  // Filtrar contratos
  const filtrados = statusFiltro === "todos" 
    ? lista 
    : lista.filter(item => item.status === statusFiltro);

  const handleVerMais = async (item) => {
    setPopupData(item);
    // Carrega transições permitidas para este contrato específico
    try {
      const response = await api.get(`/contrato/${item.id}/transicoes-status`);
      if (response.data && response.data.transicoesPermitidas) {
        setTransicoesPermitidas(prev => ({
          ...prev,
          [item.id]: response.data.transicoesPermitidas
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar transições:", error);
    }
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

        {/* Filtros por botões */}
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${statusFiltro === "todos" ? "active" : ""}`}
            onClick={() => setStatusFiltro("todos")}
          >
            <Boxes size={14} /> Todos
          </button>
          <button 
            className={`filter-btn ${statusFiltro === "em_aprovacao" ? "active" : ""}`}
            onClick={() => setStatusFiltro("em_aprovacao")}
            style={{ backgroundColor: statusConfig.em_aprovacao.bgColor, color: statusConfig.em_aprovacao.color }}
          >
            {statusConfig.em_aprovacao.icon} Em aprovação
          </button>
          <button 
            className={`filter-btn ${statusFiltro === "aprovado" ? "active" : ""}`}
            onClick={() => setStatusFiltro("aprovado")}
            style={{ backgroundColor: statusConfig.aprovado.bgColor, color: statusConfig.aprovado.color }}
          >
            {statusConfig.aprovado.icon} Aprovado
          </button>
          <button 
            className={`filter-btn ${statusFiltro === "em_execucao" ? "active" : ""}`}
            onClick={() => setStatusFiltro("em_execucao")}
            style={{ backgroundColor: statusConfig.em_execucao.bgColor, color: statusConfig.em_execucao.color }}
          >
            {statusConfig.em_execucao.icon} Em execução
          </button>
          <button 
            className={`filter-btn ${statusFiltro === "concluido" ? "active" : ""}`}
            onClick={() => setStatusFiltro("concluido")}
            style={{ backgroundColor: statusConfig.concluido.bgColor, color: statusConfig.concluido.color }}
          >
            {statusConfig.concluido.icon} Concluído
          </button>
          <button 
            className={`filter-btn ${statusFiltro === "negado" ? "active" : ""}`}
            onClick={() => setStatusFiltro("negado")}
            style={{ backgroundColor: statusConfig.negado.bgColor, color: statusConfig.negado.color }}
          >
            {statusConfig.negado.icon} Negado
          </button>
          <button 
            className={`filter-btn ${statusFiltro === "cancelado" ? "active" : ""}`}
            onClick={() => setStatusFiltro("cancelado")}
            style={{ backgroundColor: statusConfig.cancelado.bgColor, color: statusConfig.cancelado.color }}
          >
            {statusConfig.cancelado.icon} Cancelado
          </button>
        </div>

        {loading && <div className="loading">Carregando...</div>}

        <div className="lista-agendamentos">
          {!loading && filtrados.length === 0 && (
            <p style={{ opacity: 0.6 }}>Nenhum agendamento encontrado.</p>
          )}

          {filtrados.map((item) => {
            const transicoes = transicoesPermitidas[item.id] || [];
            const statusInfo = statusConfig[item.status] || statusConfig.em_aprovacao;
            
            return (
              <div key={item.id} className="ag-card">
                <div className="card-header">
                  <strong>{item.nome}</strong>
                  <span className="status-badge" style={{ 
                    backgroundColor: statusInfo.bgColor, 
                    color: statusInfo.color 
                  }}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>
                <p>Hospedagem: {item.hospedagem}</p>
                <p>Data: {item.data}</p>
                <p>Valor: R$ {item.total.toFixed(2)}</p>

                <div className="actions">
                  <button onClick={() => handleVerMais(item)}>Ver mais</button>

                  {/* Botões de ação baseados nas transições permitidas */}
                  {transicoes.map((status) => {
                    const btnInfo = getTextoBotaoStatus(status);
                    return (
                      <button
                        key={status}
                        className={btnInfo.className}
                        onClick={() => {
                          if (status === 'negado') {
                            setDenyPopup(item);
                          } else if (status === 'cancelado') {
                            setCancelPopup(item);
                          } else {
                            // Para outros status, confirmação direta
                            setConfirmPopup({...item, novoStatus: status});
                          }
                        }}
                      >
                        {btnInfo.icon} {btnInfo.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
                <span className="status-badge" style={{ 
                  backgroundColor: statusConfig[popupData.status].bgColor, 
                  color: statusConfig[popupData.status].color 
                }}>
                  {statusConfig[popupData.status].icon} {statusConfig[popupData.status].label}
                </span>
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

            {/* Botões de ação no popup */}
            <div className="popup-buttons">
              {transicoesPermitidas[popupData.id]?.map((status) => {
                const btnInfo = getTextoBotaoStatus(status);
                return (
                  <button
                    key={status}
                    className={`popup-btn ${btnInfo.className}`}
                    onClick={() => {
                      if (status === 'negado' || status === 'cancelado') {
                        // Abre popup para inserir motivo
                        if (status === 'negado') {
                          setDenyPopup(popupData);
                        } else {
                          setCancelPopup(popupData);
                        }
                      } else {
                        // Para outros status, pergunta confirmação
                        setConfirmPopup({...popupData, novoStatus: status});
                      }
                      setPopupData(null);
                    }}
                  >
                    {btnInfo.icon} {btnInfo.text}
                  </button>
                );
              })}
              
              <button className="popup-btn btn-ok" onClick={() => setPopupData(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP CONFIRMAR AÇÃO */}
      {confirmPopup && (
        <div className="popup-overlay" onClick={() => setConfirmPopup(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar ação?</h3>
            <p><strong>{confirmPopup.nome}</strong></p>
            <p>{confirmPopup.hospedagem}</p>
            <p>{confirmPopup.data}</p>
            <p>Status atual: {statusConfig[confirmPopup.status].label}</p>
            <p><strong>Novo status: {statusConfig[confirmPopup.novoStatus].label}</strong></p>
            <p><strong>Valor: R$ {confirmPopup.total.toFixed(2)}</strong></p>

            <div className="popup-buttons">
              <button 
                className="btn-confirmar" 
                onClick={async () => {
                  await alterarStatusContrato(confirmPopup.id, confirmPopup.novoStatus);
                }}
              >
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
              placeholder="Informe o motivo da negação..."
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              style={{ width: "100%", height: "80px", borderRadius: "8px", padding: "8px", margin: "10px 0" }}
            />

            <div className="popup-buttons">
              <button className="btn-negar" onClick={() => handleNegar(denyPopup.id, motivoTexto)}>
                Confirmar negação
              </button>
              <button className="btn-ok" onClick={() => {
                setDenyPopup(null);
                setMotivoTexto("");
              }}>Cancelar</button>
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
              placeholder="Informe o motivo do cancelamento..."
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              style={{ width: "100%", height: "80px", borderRadius: "8px", padding: "8px", margin: "10px 0" }}
            />

            <div className="popup-buttons">
              <button className="btn-negar" onClick={() => handleCancelar(cancelPopup.id, motivoTexto)}>
                Confirmar cancelamento
              </button>
              <button className="btn-ok" onClick={() => {
                setCancelPopup(null);
                setMotivoTexto("");
              }}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agendamento;