import "./mensagens.css";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Home, Calendar, Wrench, Users, MessageSquare,
  FileText, Settings, Boxes, Send, Clock,
  User, Check, CheckCheck
} from "lucide-react";
import api from "../../../api/api.js";
import { getIdHospedagem, logout } from "../../../utils/authUtils";
import socketManager from './socket/socketManager.js';
import { processarMensagemRecebida, criarSalaId } from '../../../utils/socketUtils.js';

const Mensagens = () => {
  const idHospedagem = getIdHospedagem();
  const [conversas, setConversas] = useState([]);
  const [conversaSelecionada, setConversaSelecionada] = useState(null);
  const [mensagemTexto, setMensagemTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const chatContainerRef = useRef(null);

  // ==============================
  // BUSCAR LISTA DE CONVERSAS COM TODAS AS MENSAGENS
  // ==============================
  const carregarConversas = async () => {
    try {
      setCarregando(true);
      console.log(`Buscando conversas para hospedagem ${idHospedagem}...`);
      
      const response = await api.get(`/mensagem/web/conversas/${idHospedagem}`);
      
      console.log("RETORNO DA API LISTA DE CONVERSAS:", response.data);
      
      // Verificar estrutura da resposta
      let dadosConversas = [];
      
      if (response.data && Array.isArray(response.data.conversas)) {
        // Nova estrutura: { conversas: [...], paginacao: {...} }
        dadosConversas = response.data.conversas;
        console.log(`Encontradas ${dadosConversas.length} conversas`);
      } else if (Array.isArray(response.data)) {
        // Estrutura antiga: array direto
        dadosConversas = response.data;
      } else if (response.data?.dados && Array.isArray(response.data.dados)) {
        dadosConversas = response.data.dados;
      }
      
      // Processar cada conversa para extrair informações úteis
      const conversasProcessadas = dadosConversas.map(conversa => {
        // Extrair informações básicas
        const idUsuario = conversa.idcontato || conversa.idusuario || conversa.id;
        const nomeUsuario = conversa.nome_contato || conversa.nome || "Usuário";
        
        // Determinar a última mensagem
        let ultimaMensagem = "";
        let ultimaData = "";
        let mensagensNaoLidas = 0;
        let todasMensagens = [];
        
        if (conversa.historico_completo && Array.isArray(conversa.historico_completo)) {
          // Nova estrutura com histórico completo
          todasMensagens = conversa.historico_completo;
          if (todasMensagens.length > 0) {
            const ultima = todasMensagens[todasMensagens.length - 1];
            ultimaMensagem = ultima.mensagem || "";
            ultimaData = ultima.data_envio || "";
          }
          mensagensNaoLidas = conversa.nao_lidas || 0;
        } else if (conversa.ultima_mensagem) {
          // Estrutura com objeto ultima_mensagem
          ultimaMensagem = conversa.ultima_mensagem.mensagem || "";
          ultimaData = conversa.ultima_mensagem.data_envio || "";
          mensagensNaoLidas = conversa.nao_lidas || 0;
        } else {
          // Fallback
          ultimaMensagem = conversa.ultimaMensagem || "";
          ultimaData = conversa.ultimaData || "";
          mensagensNaoLidas = conversa.naoLidas || 0;
        }
        
        return {
          id: idUsuario,
          nome: nomeUsuario,
          ultimaMensagem: ultimaMensagem,
          ultimaData: ultimaData,
          mensagensNaoLidas: mensagensNaoLidas,
          todasMensagens: todasMensagens,
          // Informações extras
          totalMensagens: conversa.total_mensagens || todasMensagens.length || 0,
          primeiraMensagem: conversa.primeira_mensagem,
          ultimaMensagemDetalhada: conversa.ultima_mensagem
        };
      });
      
      // Ordenar por data da última mensagem (mais recente primeiro)
      conversasProcessadas.sort((a, b) => {
        const dataA = new Date(a.ultimaData);
        const dataB = new Date(b.ultimaData);
        return dataB - dataA;
      });
      
      setConversas(conversasProcessadas);
      
      // Se houver conversas, selecionar a primeira automaticamente
      if (conversasProcessadas.length > 0 && !conversaSelecionada) {
        abrirConversa(conversasProcessadas[0]);
      }
      
    } catch (err) {
      console.error("Erro ao carregar conversas:", err);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      }
    } finally {
      setCarregando(false);
    }
  };

  // ==============================
// WEBSOCKET INTEGRATION
// ==============================
useEffect(() => {
  // Inicializar socket para esta hospedagem
  const socketInstance = socketManager.getInstance(idHospedagem);
  
  if (socketInstance) {
    // Configurar callback para novas mensagens
    socketInstance.onMessage((novaMensagem) => {
      console.log('Nova mensagem via socket:', novaMensagem);
      
      // Atualizar conversa selecionada se for a mesma conversa
      if (conversaSelecionada && 
          (novaMensagem.id_remetente === conversaSelecionada.id || 
           novaMensagem.id_destinatario === conversaSelecionada.id)) {
        
        const novaMensagemFormatada = {
          id: novaMensagem.idmensagem || novaMensagem.id,
          remetente: novaMensagem.id_remetente === parseInt(idHospedagem) 
            ? { id: idHospedagem, tipo: 'hospedagem', nome: 'Você' }
            : { id: novaMensagem.id_remetente, tipo: 'usuario', nome: conversaSelecionada.nome },
          destinatario: novaMensagem.id_destinatario === parseInt(idHospedagem)
            ? { id: idHospedagem, tipo: 'hospedagem', nome: 'Você' }
            : { id: novaMensagem.id_destinatario, tipo: 'usuario', nome: conversaSelecionada.nome },
          texto: novaMensagem.mensagem,
          data_envio: novaMensagem.data_envio,
          lida: novaMensagem.lida || false,
          autor: novaMensagem.id_remetente === parseInt(idHospedagem) ? 'hospedagem' : 'cliente'
        };
        
        setConversaSelecionada(prev => ({
          ...prev,
          mensagens: [...prev.mensagens, novaMensagemFormatada],
          totalMensagens: prev.totalMensagens + 1
        }));
      }
      
      // Atualizar lista de conversas
      processarMensagemRecebida(novaMensagem, conversas, setConversas);
    });
    
    // Configurar callback para notificações
    socketInstance.onNotification((notificacao) => {
      console.log('Nova notificação:', notificacao);
      // Aqui você pode adicionar um toast notification
    });
  }
  
  // Cleanup ao desmontar o componente
  return () => {
    if (conversaSelecionada) {
      socketInstance?.sairConversa(conversaSelecionada.id);
    }
  };
}, [idHospedagem, conversas, conversaSelecionada]);

// Efeito para entrar/sair da sala quando mudar a conversa selecionada
useEffect(() => {
  const socketInstance = socketManager.getInstance(idHospedagem);
  
  if (socketInstance && conversaSelecionada) {
    // Entrar na sala da conversa atual
    socketInstance.entrarConversa(conversaSelecionada.id);
    
    // Marcar mensagens como lidas via socket
    socketInstance.marcarMensagemLida(null, conversaSelecionada.id);
  }
  
  return () => {
    if (socketInstance && conversaSelecionada) {
      socketInstance.sairConversa(conversaSelecionada.id);
    }
  };
}, [conversaSelecionada, idHospedagem]);

  useEffect(() => {
    carregarConversas();
    
    // Atualizar conversas a cada 30 segundos
    const intervalo = setInterval(() => {
      carregarConversas();
    }, 30000);
    
    return () => clearInterval(intervalo);
  }, []);

  // Rolagem automática para a última mensagem
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversaSelecionada?.mensagens]);

  // ==============================
  // ABRIR CONVERSA / BUSCAR MENSAGENS
  // ==============================
  const abrirConversa = async (conversa) => {
    try {
      console.log(`Abrindo conversa com usuário ${conversa.id} (${conversa.nome})`);
      
      // Se já temos todas as mensagens no objeto da conversa, usá-las
      if (conversa.todasMensagens && conversa.todasMensagens.length > 0) {
        console.log("Usando mensagens já carregadas:", conversa.todasMensagens.length);
        
        const mensagensFormatadas = conversa.todasMensagens.map(msg => ({
          id: msg.id,
          remetente: msg.remetente,
          destinatario: msg.destinatario,
          texto: msg.mensagem,
          data_envio: msg.data_envio,
          lida: msg.lida,
          autor: msg.remetente?.tipo === 'hospedagem' ? 'hospedagem' : 'cliente'
        }));
        
        setConversaSelecionada({
          id: conversa.id,
          nome: conversa.nome,
          mensagens: mensagensFormatadas,
          totalMensagens: conversa.totalMensagens
        });
        
        // Marcar mensagens não lidas como lidas
        marcarComoLidas(conversa.id);
        
        return;
      }
      
      // Se não tivermos as mensagens, buscar da API
      console.log("Buscando mensagens da API...");
      const response = await api.get(`/mensagem/web/conversa/${idHospedagem}/${conversa.id}`);
      
      console.log("Retorno da API de mensagens:", response.data);
      
      let msgs = [];
      
      if (response.data && Array.isArray(response.data.conversa)) {
        msgs = response.data.conversa;
      } else if (Array.isArray(response.data)) {
        msgs = response.data;
      } else if (response.data?.dados && Array.isArray(response.data.dados)) {
        msgs = response.data.dados;
      }
      
      // Formatar mensagens
      const mensagensFormatadas = msgs.map(m => ({
        id: m.idmensagem || m.id,
        remetente: m.id_remetente === parseInt(idHospedagem) 
          ? { id: idHospedagem, tipo: 'hospedagem', nome: 'Você' }
          : { id: m.id_remetente, tipo: 'usuario', nome: conversa.nome },
        destinatario: m.id_destinatario === parseInt(idHospedagem)
          ? { id: idHospedagem, tipo: 'hospedagem', nome: 'Você' }
          : { id: m.id_destinatario, tipo: 'usuario', nome: conversa.nome },
        texto: m.mensagem || m.texto,
        data_envio: m.data_envio || m.data,
        lida: m.lida || false,
        autor: m.id_remetente === parseInt(idHospedagem) ? 'hospedagem' : 'cliente'
      }));
      
      setConversaSelecionada({
        id: conversa.id,
        nome: conversa.nome,
        mensagens: mensagensFormatadas,
        totalMensagens: mensagensFormatadas.length
      });
      
      // Marcar mensagens não lidas como lidas
      marcarComoLidas(conversa.id);
      
    } catch (err) {
      console.error("Erro ao abrir conversa:", err);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      }
    }
  };

  // Marcar mensagens como lidas
  const marcarComoLidas = async (idUsuario) => {
    try {
      // Buscar mensagens não lidas deste usuário
      const conversa = conversas.find(c => c.id === idUsuario);
      if (conversa && conversa.todasMensagens) {
        const mensagensNaoLidas = conversa.todasMensagens.filter(
          msg => !msg.lida && msg.remetente?.tipo === 'usuario'
        );
        
        // Marcar cada mensagem como lida
        for (const msg of mensagensNaoLidas) {
          try {
            await api.put(`/mensagem/${msg.id}/ler`);
          } catch (err) {
            console.error(`Erro ao marcar mensagem ${msg.id} como lida:`, err);
          }
        }
        
        // Atualizar estado local
        if (mensagensNaoLidas.length > 0) {
          setConversas(prev => prev.map(c => {
            if (c.id === idUsuario) {
              return { ...c, mensagensNaoLidas: 0 };
            }
            return c;
          }));
        }
      }
    } catch (err) {
      console.error("Erro ao marcar mensagens como lidas:", err);
    }
  };

  // ==============================
  // ENVIAR MENSAGEM
  // ==============================
  const enviarMensagem = async () => {
  if (!mensagemTexto.trim() || !conversaSelecionada) return;
  
  try {
    console.log("Enviando mensagem para usuário:", conversaSelecionada.id);
    
    const response = await api.post("/mensagem/web", {
      idhospedagem: parseInt(idHospedagem),
      idusuario: conversaSelecionada.id,
      mensagem: mensagemTexto.trim()
    });
    
    // Enviar também via socket se disponível
    const socketInstance = socketManager.getInstance(idHospedagem);
    if (socketInstance) {
      socketInstance.enviarMensagem({
        ...response.data.data,
        sala: `conversa_${idHospedagem}_${conversaSelecionada.id}`
      });
    }
    
    // Limpar input
    setMensagemTexto("");
    
    // Recarregar conversas
    await carregarConversas();
    
    const conversaAtualizada = conversas.find(c => c.id === conversaSelecionada.id);
    if (conversaAtualizada) {
      abrirConversa(conversaAtualizada);
    }
    
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
  }
};

  // Formatar data da mensagem
  const formatarData = (dataString) => {
    if (!dataString) return "";
    
    const data = new Date(dataString);
    const hoje = new Date();
    
    // Verificar se é hoje
    if (data.toDateString() === hoje.toDateString()) {
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Verificar se foi ontem
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    if (data.toDateString() === ontem.toDateString()) {
      return "Ontem " + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Outros dias
    return data.toLocaleDateString('pt-BR') + " " + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Formatar data para a lista de conversas
  const formatarDataConversa = (dataString) => {
    if (!dataString) return "";
    
    const data = new Date(dataString);
    const hoje = new Date();
    const diferencaDias = Math.floor((hoje - data) / (1000 * 60 * 60 * 24));
    
    if (diferencaDias === 0) {
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diferencaDias === 1) {
      return "Ontem";
    } else if (diferencaDias < 7) {
      return `${diferencaDias} dias atrás`;
    } else {
      return data.toLocaleDateString('pt-BR');
    }
  };

  // Enviar com Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  return (
    <div className="container mensagens-container">
      <aside className="sidebar">
        <h2 className="logo">PetFamily</h2>

        <nav className="menu">
          <Link className="menu-item" to="/home"><Home size={16} /> Início</Link>
          <Link className="menu-item" to="/agendamento"><Calendar size={16} /> Agendamentos</Link>
          <Link className="menu-item" to="/servico"><Wrench size={16} /> Serviços</Link>
          <Link className="menu-item active" to="/mensagens"><MessageSquare size={16} /> Mensagens</Link>
          <Link className="menu-item" to="/interacoes"><Boxes size={16} /> Interações</Link>
          <Link className="menu-item" to="/documentos"><FileText size={16} /> Documentos</Link>
          <Link className="menu-item" to="/configuracoes"><Settings size={16} /> Configurações</Link>
        </nav>

        <button className="logout" onClick={logout}>⟵ Sair</button>
      </aside>

      <main className="content">
        <div className="mensagens-header">
          <h1>Mensagens</h1>
          <button 
            className="btn-atualizar" 
            onClick={carregarConversas}
            disabled={carregando}
          >
            {carregando ? "Atualizando..." : "Atualizar"}
          </button>
        </div>

        {carregando && conversas.length === 0 ? (
          <div className="carregando-container">
            <div className="spinner"></div>
            <p>Carregando conversas...</p>
          </div>
        ) : (
          <div className="message-layout">
            {/* LISTA DE CONVERSAS */}
            <div className="chat-list-container">
              <div className="chat-list-header">
                <h3>Conversas ({conversas.length})</h3>
              </div>
              
              <div className="chat-list">
                {conversas.length === 0 ? (
                  <div className="sem-conversas">
                    <MessageSquare size={48} />
                    <p>Nenhuma conversa encontrada</p>
                    <small>Quando um usuário enviar uma mensagem, ela aparecerá aqui.</small>
                  </div>
                ) : (
                  conversas.map((conversa) => {
                    const isSelecionada = conversaSelecionada?.id === conversa.id;
                    
                    return (
                      <div
                        key={conversa.id}
                        className={`chat-item ${isSelecionada ? "active-chat" : ""}`}
                        onClick={() => abrirConversa(conversa)}
                      >
                        <div className="chat-item-avatar">
                          <User size={20} />
                        </div>
                        
                        <div className="chat-item-content">
                          <div className="chat-item-header">
                            <strong className="chat-item-nome">{conversa.nome}</strong>
                            <span className="chat-item-data">
                              {formatarDataConversa(conversa.ultimaData)}
                            </span>
                          </div>
                          
                          <p className="chat-item-preview">
                            {conversa.ultimaMensagem && conversa.ultimaMensagem.length > 40
                              ? conversa.ultimaMensagem.substring(0, 40) + "..."
                              : conversa.ultimaMensagem || "Sem mensagens"}
                          </p>
                          
                          <div className="chat-item-footer">
                            <span className="chat-item-count">
                              {conversa.totalMensagens} mensagens
                            </span>
                            
                            {conversa.mensagensNaoLidas > 0 && (
                              <span className="badge-nao-lidas">
                                {conversa.mensagensNaoLidas}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* JANELA DE CHAT */}
            <div className="chat-window-container">
              {conversaSelecionada ? (
                <>
                  <div className="chat-header">
                    <div className="chat-header-info">
                      <div className="chat-header-avatar">
                        <User size={24} />
                      </div>
                      <div>
                        <strong>{conversaSelecionada.nome}</strong>
                        <small>{conversaSelecionada.totalMensagens} mensagens na conversa</small>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="chat-body" 
                    ref={chatContainerRef}
                  >
                    {conversaSelecionada.mensagens.length === 0 ? (
                      <div className="sem-mensagens-chat">
                        <p>Nenhuma mensagem nesta conversa</p>
                        <small>Envie uma mensagem para iniciar a conversa.</small>
                      </div>
                    ) : (
                      conversaSelecionada.mensagens.map((mensagem, index) => {
                        const isHospedagem = mensagem.autor === 'hospedagem';
                        const dataFormatada = formatarData(mensagem.data_envio);
                        
                        return (
                          <div
                            key={mensagem.id || index}
                            className={`mensagem-container ${isHospedagem ? 'mensagem-direita' : 'mensagem-esquerda'}`}
                          >
                            <div className={`mensagem-bolha ${isHospedagem ? 'mensagem-voce' : 'mensagem-cliente'}`}>
                              <div className="mensagem-texto">
                                {mensagem.texto}
                              </div>
                              <div className="mensagem-info">
                                <span className="mensagem-data">{dataFormatada}</span>
                                {isHospedagem && (
                                  <span className="mensagem-status">
                                    {mensagem.lida ? (
                                      <CheckCheck size={12} />
                                    ) : (
                                      <Check size={12} />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="chat-input-area">
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder="Digite sua mensagem..."
                        value={mensagemTexto}
                        onChange={(e) => setMensagemTexto(e.target.value)}
                        onKeyPress={handleKeyPress}
                        autoFocus
                      />
                      <button 
                        className="btn-enviar"
                        onClick={enviarMensagem}
                        disabled={!mensagemTexto.trim()}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="selecionar-conversa">
                  <MessageSquare size={64} />
                  <h3>Selecione uma conversa</h3>
                  <p>Clique em um usuário à esquerda para ver o histórico de mensagens</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Mensagens;