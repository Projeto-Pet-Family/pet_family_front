import socketClient from './socketClient';

class SocketEvents {
  constructor(idHospedagem) {
    this.idHospedagem = idHospedagem;
    this.socket = null;
    this.messageCallbacks = [];
    this.notificationCallbacks = [];
    this.statusCallbacks = [];
  }

  // Inicializar eventos do socket
  initialize() {
    this.socket = socketClient.connect(this.idHospedagem);
    
    if (!this.socket) {
      console.warn('⚠️ Socket não inicializado');
      return;
    }

    // Evento de nova mensagem
    this.socket.on('nova-mensagem', (mensagem) => {
      console.log('📩 Nova mensagem recebida via socket:', mensagem);
      
      // Notificar todos os callbacks registrados
      this.messageCallbacks.forEach(callback => {
        try {
          callback(mensagem);
        } catch (error) {
          console.error('Erro no callback de mensagem:', error);
        }
      });
    });

    // Evento de notificação
    this.socket.on('notificacao-nova-mensagem', (notificacao) => {
      console.log('🔔 Nova notificação:', notificacao);
      
      // Mostrar notificação visual (pode ser integrado com react-toastify ou similar)
      this.showNotification(notificacao);
      
      // Notificar callbacks
      this.notificationCallbacks.forEach(callback => {
        try {
          callback(notificacao);
        } catch (error) {
          console.error('Erro no callback de notificação:', error);
        }
      });
    });

    // Evento de status online
    this.socket.on('status-usuario', (data) => {
      console.log('👤 Status do usuário:', data);
      
      this.statusCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Erro no callback de status:', error);
        }
      });
    });

    // Evento de mensagem lida
    this.socket.on('mensagem-lida', (data) => {
      console.log('✅ Mensagem marcada como lida:', data);
      
      // Atualizar status da mensagem localmente
      this.updateMessageStatus(data);
    });

    // Evento de erro
    this.socket.on('socket-error', (error) => {
      console.error('❌ Erro no socket:', error);
    });
  }

  // Registrar callback para nova mensagem
  onMessage(callback) {
    if (typeof callback === 'function') {
      this.messageCallbacks.push(callback);
    }
  }

  // Registrar callback para notificações
  onNotification(callback) {
    if (typeof callback === 'function') {
      this.notificationCallbacks.push(callback);
    }
  }

  // Registrar callback para status
  onStatusUpdate(callback) {
    if (typeof callback === 'function') {
      this.statusCallbacks.push(callback);
    }
  }

  // Entrar na sala de uma conversa específica
  entrarConversa(idUsuario) {
    if (this.socket) {
      const salaId = `conversa_${this.idHospedagem}_${idUsuario}`;
      socketClient.entrarSala(salaId);
    }
  }

  // Sair da sala de uma conversa
  sairConversa(idUsuario) {
    if (this.socket) {
      const salaId = `conversa_${this.idHospedagem}_${idUsuario}`;
      socketClient.sairSala(salaId);
    }
  }

  // Enviar mensagem via socket
  enviarMensagem(mensagemData) {
    if (this.socket && socketClient.isConnected) {
      socketClient.emit('enviar-mensagem', mensagemData);
      return true;
    }
    return false;
  }

  // Marcar mensagem como lida via socket
  marcarMensagemLida(idMensagem, idUsuario) {
    if (this.socket) {
      socketClient.emit('marcar-lida', {
        idMensagem,
        idHospedagem: this.idHospedagem,
        idUsuario
      });
    }
  }

  // Mostrar notificação visual
  showNotification(notificacao) {
    // Usar a API de Notificações do navegador se disponível
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nova mensagem', {
        body: `${notificacao.remetente}: ${notificacao.mensagem}`,
        icon: '/icon.png'
      });
    }
    
    // Ou usar console/alert como fallback
    console.log(`📢 Nova mensagem de ${notificacao.remetente}: ${notificacao.mensagem}`);
  }

  // Atualizar status da mensagem localmente
  updateMessageStatus(data) {
    // Esta função será sobrescrita pelo componente
    console.log('Atualizar status da mensagem:', data);
  }

  // Limpar todos os callbacks
  cleanup() {
    this.messageCallbacks = [];
    this.notificationCallbacks = [];
    this.statusCallbacks = [];
    
    if (this.socket) {
      socketClient.disconnect();
    }
  }

  // Verificar se está conectado
  isConnected() {
    return socketClient.isConnected;
  }

  // Obter ID do socket
  getSocketId() {
    return this.socket?.id;
  }
}

export default SocketEvents;