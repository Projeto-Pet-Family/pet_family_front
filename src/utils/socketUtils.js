// Utilitários para manipulação de sockets

// Criar ID da sala de conversa
export const criarSalaId = (idHospedagem, idUsuario) => {
  return `conversa_${idHospedagem}_${idUsuario}`;
};

// Verificar se é uma mensagem da hospedagem
export const isMensagemHospedagem = (mensagem, idHospedagem) => {
  return mensagem.id_remetente === parseInt(idHospedagem) || mensagem.autor === 'hospedagem';
};

// Formatar mensagem para envio via socket
export const formatarMensagemParaSocket = (mensagem, idHospedagem, idUsuario) => {
  return {
    ...mensagem,
    sala: criarSalaId(idHospedagem, idUsuario),
    timestamp: new Date().toISOString(),
    tipo: 'hospedagem'
  };
};

// Processar mensagem recebida do socket
export const processarMensagemRecebida = (mensagemSocket, conversas, setConversas) => {
  const { id_remetente, id_destinatario, mensagem, data_envio } = mensagemSocket;
  
  // Atualizar lista de conversas
  const novaConversas = [...conversas];
  const conversaIndex = novaConversas.findIndex(c => 
    c.id === id_remetente || c.id === id_destinatario
  );
  
  if (conversaIndex !== -1) {
    // Atualizar conversa existente
    const conversa = novaConversas[conversaIndex];
    novaConversas[conversaIndex] = {
      ...conversa,
      ultimaMensagem: mensagem,
      ultimaData: data_envio,
      mensagensNaoLidas: conversa.mensagensNaoLidas + 1
    };
    
    // Mover para o topo da lista
    const [conversaAtualizada] = novaConversas.splice(conversaIndex, 1);
    novaConversas.unshift(conversaAtualizada);
  } else {
    // Criar nova conversa (se for uma nova mensagem de um usuário)
    novaConversas.unshift({
      id: id_remetente,
      nome: mensagemSocket.nome_remetente || 'Usuário',
      ultimaMensagem: mensagem,
      ultimaData: data_envio,
      mensagensNaoLidas: 1,
      totalMensagens: 1
    });
  }
  
  setConversas(novaConversas);
  return novaConversas;
};

// Solicitar permissão para notificações
export const solicitarPermissaoNotificacoes = () => {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Permissão para notificações:', permission);
      });
    }
    return Notification.permission;
  }
  return 'not-supported';
};

// Mostrar notificação push
export const mostrarNotificacao = (titulo, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(titulo, {
      icon: '/icon.png',
      badge: '/badge.png',
      ...options
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return notification;
  }
  
  // Fallback para consoles
  console.log(`📢 ${titulo}: ${options.body || ''}`);
  return null;
};