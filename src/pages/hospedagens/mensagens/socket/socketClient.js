import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Conectar ao servidor Socket.IO
  connect(idHospedagem) {
    if (this.socket && this.isConnected) {
      console.log('✅ Socket já está conectado');
      return;
    }

    try {
      const socketUrl = process.env.REACT_APP_WS_URL || 'http://localhost:3001';
      
      this.socket = io(socketUrl, {
        query: {
          tipo: 'hospedagem',
          id: idHospedagem
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      this.setupEventListeners();
      console.log('🔄 Conectando ao servidor Socket.IO...');
      
    } catch (error) {
      console.error('❌ Erro ao conectar Socket.IO:', error);
    }
  }

  // Configurar listeners padrão
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Conectado ao servidor Socket.IO');
      this.isConnected = true;
      this.emit('hospedagem-online', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado do servidor:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconectado (tentativa ${attemptNumber})`);
      this.isConnected = true;
    });
  }

  // Entrar em uma sala específica
  entrarSala(salaId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('entrar-sala', salaId);
      console.log(`Entrou na sala: ${salaId}`);
    }
  }

  // Sair de uma sala
  sairSala(salaId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('sair-sala', salaId);
      console.log(`Saiu da sala: ${salaId}`);
    }
  }

  // Adicionar listener para evento específico
  on(eventName, callback) {
    if (!this.socket) return;

    this.socket.on(eventName, callback);
    
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  // Emitir evento
  emit(eventName, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn('⚠️ Socket não conectado, evento não enviado:', eventName);
    }
  }

  // Desconectar
  disconnect() {
    if (this.socket) {
      this.listeners.forEach((callbacks, eventName) => {
        callbacks.forEach(callback => {
          this.socket.off(eventName, callback);
        });
      });
      this.listeners.clear();
      
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 Socket desconectado');
    }
  }

  // Métodos específicos para mensagens
  onMessage(callback) {
    this.on('nova-mensagem', callback);
  }

  onNotification(callback) {
    this.on('notificacao-nova-mensagem', callback);
  }

  entrarConversa(idUsuario) {
    const salaId = `conversa_${this.socket?.id}_${idUsuario}`;
    this.entrarSala(salaId);
  }

  sairConversa(idUsuario) {
    const salaId = `conversa_${this.socket?.id}_${idUsuario}`;
    this.sairSala(salaId);
  }

  enviarMensagem(mensagemData) {
    this.emit('enviar-mensagem', mensagemData);
  }

  marcarMensagemLida(idMensagem, idUsuario) {
    this.emit('marcar-lida', {
      idMensagem,
      idUsuario
    });
  }
}

export default SocketClient;