import React, { useState, useEffect } from "react";
import "./servico.css";
import { Link, useNavigate } from 'react-router-dom';
import { Home, Calendar, Wrench, Users, MessageSquare, FileText, Settings, Boxes, Pencil, Trash2, Plus, Loader } from "lucide-react";
import api from '../../../api/api.js';
import { getIdHospedagem, logout } from '../../../utils/authUtils.js';

const ServicoScreen = () => {
  const navigate = useNavigate();
  const [idHospedagem, setIdHospedagem] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [popupExcluir, setPopupExcluir] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // Função auxiliar para formatar preço
  const formatarPreco = (valor) => {
    if (valor === null || valor === undefined || valor === "") return "0,00";
    
    const numero = typeof valor === 'string' ? parseFloat(valor) : Number(valor);
    
    if (isNaN(numero)) return "0,00";
    
    return numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para extrair ID do serviço de forma segura
  const getServiceId = (servico) => {
    if (!servico) return null;
    
    // Tenta diferentes possibilidades de nomes de campo
    return servico.idServico || servico.id || 
           servico.idservico || servico.ID || 
           servico.serviceId;
  };

  // Verificar autenticação e obter idHospedagem
  useEffect(() => {
    const hospedagemId = getIdHospedagem();
    
    if (!hospedagemId) {
      navigate('/login');
      return;
    }
    
    setIdHospedagem(hospedagemId);
  }, [navigate]);

  // Carregar serviços quando idHospedagem estiver disponível
  useEffect(() => {
    if (idHospedagem) {
      carregarServicos();
    }
  }, [idHospedagem]);

  const carregarServicos = async () => {
    if (!idHospedagem) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log(`Buscando serviços para hospedagem: ${idHospedagem}`);
      const response = await api.get(`/hospedagens/${idHospedagem}/servicos`);
      console.log("Resposta da API (crua):", response);
      console.log("Dados recebidos:", response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn("Dados recebidos não são um array:", response.data);
        setServices([]);
        return;
      }
      
      // Mapear os dados recebidos para uma estrutura consistente
      const servicosFormatados = response.data.map((servico, index) => {
        console.log(`Serviço ${index}:`, servico);
        
        // Extrair ID usando nossa função
        const id = getServiceId(servico);
        
        // Extrair nome/descrição
        const nome = servico.descricao || servico.nome || servico.name || `Serviço ${index + 1}`;
        
        // Extrair e converter preço
        let preco = servico.preco || servico.price || servico.valor || 0;
        if (typeof preco === 'string') {
          preco = parseFloat(preco);
        }
        preco = Number(preco);
        
        return {
          // Campos originais mantidos para referência
          raw: servico,
          // Campos padronizados
          id: id || `temp-${Date.now()}-${index}`,
          nome: nome,
          preco: isNaN(preco) ? 0 : preco,
          // Campos originais para compatibilidade
          descricao: nome,
          idServico: id
        };
      });
      
      console.log("Serviços formatados:", servicosFormatados);
      setServices(servicosFormatados);
    } catch (err) {
      console.error("Erro detalhado ao carregar serviços:", err);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Dados do erro:", err.response.data);
      }
      
      if (err.response?.status === 404) {
        setError("Hospedagem não encontrada. Verifique o ID da hospedagem.");
      } else if (err.response?.status === 500) {
        setError("Erro no servidor ao carregar serviços.");
      } else {
        setError("Erro ao carregar serviços. Verifique sua conexão.");
      }
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingService(null);
    setName("");
    setPrice("");
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    console.log("Editando serviço:", service);
    setEditingService(service);
    setName(service.nome || service.descricao || service.name || "");
    setPrice(String(service.preco || service.price || ""));
    setModalOpen(true);
  };

  const abrirPopupExcluir = (service) => {
    console.log("Serviço para excluir:", service);
    setServiceToDelete(service);
    setPopupExcluir(true);
  };

  const confirmarExclusao = async () => {
    if (!serviceToDelete) {
      console.error("Nenhum serviço selecionado para exclusão");
      setPopupExcluir(false);
      return;
    }
    
    try {
      const serviceId = getServiceId(serviceToDelete);
      console.log("ID do serviço para exclusão:", serviceId);
      
      if (!serviceId) {
        throw new Error("ID do serviço não encontrado");
      }
      
      // Verificar se é um ID real (não temporário)
      if (serviceId.toString().startsWith('temp-')) {
        console.log("ID temporário, removendo apenas localmente");
      } else {
        console.log("Excluindo do backend:", serviceId);
        await api.delete(`/servicos/${serviceId}`);
      }
      
      // Remover da lista local
      setServices(services.filter((s) => {
        const currentId = getServiceId(s);
        return currentId !== serviceId;
      }));
      
      setPopupExcluir(false);
      setServiceToDelete(null);
    } catch (err) {
      console.error("Erro detalhado ao excluir serviço:", err);
      setError(`Erro ao excluir serviço: ${err.message || "Tente novamente."}`);
      setPopupExcluir(false);
    }
  };

  const saveService = async () => {
    // Validações
    if (!name.trim()) {
      alert("Nome do serviço é obrigatório");
      return;
    }

    const precoNumero = parseFloat(price);
    if (isNaN(precoNumero) || precoNumero < 0) {
      alert("Preço deve ser um número positivo");
      return;
    }

    try {
      const serviceData = {
        descricao: name.trim(),
        preco: precoNumero
      };

      console.log("Salvando serviço:", editingService ? "EDITAR" : "CRIAR");
      console.log("Dados do serviço:", serviceData);

      if (editingService) {
        // EDITAR SERVIÇO EXISTENTE
        const serviceId = getServiceId(editingService);
        console.log("ID do serviço para edição:", serviceId);
        
        if (!serviceId) {
          throw new Error("ID do serviço não encontrado para edição");
        }

        // Verificar se é um ID real ou temporário
        if (serviceId.toString().startsWith('temp-')) {
          console.log("ID temporário, atualizando apenas localmente");
          // Atualizar na lista local
          setServices(services.map((s) => {
            const currentId = getServiceId(s);
            if (currentId === serviceId) {
              return {
                ...s,
                nome: serviceData.descricao,
                descricao: serviceData.descricao,
                preco: serviceData.preco
              };
            }
            return s;
          }));
        } else {
          console.log("Atualizando no backend...");
          // ID real - atualizar no backend
          const response = await api.put(`/servicos/${serviceId}`, serviceData);
          console.log("Resposta da atualização:", response.data);
          
          // Atualizar na lista local
          setServices(services.map((s) => {
            const currentId = getServiceId(s);
            if (currentId === serviceId) {
              return {
                ...s,
                nome: serviceData.descricao,
                descricao: serviceData.descricao,
                preco: serviceData.preco,
                ...response.data.data
              };
            }
            return s;
          }));
        }
      } else {
        // CRIAR NOVO SERVIÇO
        console.log("Criando novo serviço para hospedagem:", idHospedagem);
        
        try {
          const response = await api.post(`/hospedagens/${idHospedagem}/servicos`, serviceData);
          console.log("Resposta da criação:", response.data);
          
          // Extrair ID da resposta
          const novoId = response.data.data?.idServico || 
                        response.data.data?.id || 
                        response.data.idServico ||
                        `temp-${Date.now()}`;
          
          const novoServico = {
            id: novoId,
            nome: serviceData.descricao,
            descricao: serviceData.descricao,
            preco: serviceData.preco,
            idServico: novoId,
            raw: response.data.data || {}
          };
          
          console.log("Novo serviço criado:", novoServico);
          setServices([...services, novoServico]);
        } catch (postError) {
          console.error("Erro ao criar serviço no backend:", postError);
          
          // Se falhar no backend, adicionar localmente com ID temporário
          const novoServico = {
            id: `temp-${Date.now()}`,
            nome: serviceData.descricao,
            descricao: serviceData.descricao,
            preco: serviceData.preco,
            idServico: `temp-${Date.now()}`
          };
          
          setServices([...services, novoServico]);
          setError("Serviço criado localmente (modo offline).");
        }
      }

      setModalOpen(false);
      setEditingService(null);
      setName("");
      setPrice("");
    } catch (err) {
      console.error("Erro detalhado ao salvar serviço:", err);
      
      let errorMessage = "Erro ao salvar serviço";
      
      if (err.response) {
        console.error("Status do erro:", err.response.status);
        console.error("Dados do erro:", err.response.data);
        
        if (err.response.status === 400) {
          errorMessage = "Dados inválidos. Verifique as informações.";
        } else if (err.response.status === 404) {
          errorMessage = "Serviço ou hospedagem não encontrado.";
        } else if (err.response.status === 500) {
          errorMessage = `Erro no servidor: ${err.response.data?.error || "Tente novamente."}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!idHospedagem) {
    return (
      <div className="container">
        <aside className="sidebar">
          <h2 className="logo">PetFamily</h2>
          <nav className="menu">
            {/* Menu simplificado enquanto carrega */}
          </nav>
        </aside>
        <main className="content">
          <div className="loading">
            <Loader size={24} className="spinner" />
            <p>Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <aside className="sidebar">
        <h2 className="logo">PetFamily</h2>
        <div className="hospedagem-info">
          <small>Hospedagem: {idHospedagem}</small>
        </div>

        <nav className="menu">
          <Link className="menu-item" to="/home"><Home size={16}/> Início</Link>
          <Link className="menu-item" to="/agendamento"><Calendar size={16}/> Agendamentos</Link>
          <Link className="menu-item active" to="/servico"><Wrench size={16}/> Serviços</Link>
     {/*      <Link className="menu-item" to="/funcionario"><Users size={16}/> Funcionários</Link> */}
          <Link className="menu-item" to="/mensagens"><MessageSquare size={16}/> Mensagens</Link>
          <Link className="menu-item" to="/interacoes"><Boxes size={16}/> Interações</Link>
          <Link className="menu-item" to="/documentos"><FileText size={16}/> Documentos</Link>
          <Link className="menu-item" to="/configuracoes"><Settings size={16}/> Configurações</Link>
        </nav>

        <button className="logout" onClick={handleLogout}>
          ⟵ Sair
        </button>
      </aside>

      <main className="content">
        <div className="header">
          <div>
            <h1>Serviços</h1>
          </div>
          <button className="add-btn" onClick={openAddModal}>
            <Plus size={18}/> Adicionar Serviço
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <Loader size={24} className="spinner" />
            <p>Carregando serviços...</p>
          </div>
        ) : (
          <div className="service-list">
            {services.length === 0 ? (
              <p className="empty">Nenhum serviço cadastrado.</p>
            ) : (
              services.map((service, index) => {
                const precoFormatado = formatarPreco(service.preco);
                const serviceKey = service.id || `service-${index}`;
                const serviceId = getServiceId(service);
                
                return (
                  <div className="service-card" key={serviceKey}>
                    <h3>{service.nome || service.descricao || `Serviço ${index + 1}`}</h3>
                    <p>Preço: R$ {precoFormatado}</p>

                    <div className="actions">
                      <button className="edit" onClick={() => openEditModal(service)}>
                        <Pencil size={16}/>
                      </button>
                      <button className="delete" onClick={() => abrirPopupExcluir(service)}>
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {popupExcluir && (
          <div className="modal">
            <div className="modal-box">
              <h2>Excluir Serviço</h2>
              <p>
                Tem certeza que deseja excluir o serviço <strong>{serviceToDelete?.nome || serviceToDelete?.descricao || "este serviço"}</strong>?
              </p>

              <div className="modal-actions">
                <button className="save" onClick={confirmarExclusao}>
                  Confirmar
                </button>

                <button className="cancel" onClick={() => setPopupExcluir(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {modalOpen && (
          <div className="modal">
            <div className="modal-box">
              <h2>{editingService ? "Editar Serviço" : "Novo Serviço"}</h2>

              <input
                type="text"
                placeholder="Nome do serviço"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="number"
                placeholder="Preço (ex: 50.00)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
              />

              <div className="modal-actions">
                <button className="save" onClick={saveService}>
                  {editingService ? "Atualizar" : "Criar"}
                </button>
                <button className="cancel" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ServicoScreen;