import SocketClient from './socketClient';

class SocketManager {
  constructor() {
    this.socketInstances = new Map();
  }

  // Obter ou criar instância para uma hospedagem
  getInstance(idHospedagem) {
    if (!idHospedagem) {
      console.error('❌ ID da hospedagem é obrigatório');
      return null;
    }

    // Se já existe uma instância, retorná-la
    if (this.socketInstances.has(idHospedagem)) {
      return this.socketInstances.get(idHospedagem);
    }

    // Criar nova instância
    const socketClient = new SocketClient();
    this.socketInstances.set(idHospedagem, socketClient);
    
    return socketClient;
  }

  // Remover instância
  removeInstance(idHospedagem) {
    if (this.socketInstances.has(idHospedagem)) {
      const instance = this.socketInstances.get(idHospedagem);
      instance.disconnect();
      this.socketInstances.delete(idHospedagem);
      console.log(`Instância do socket removida para hospedagem ${idHospedagem}`);
    }
  }
}

// Singleton para gerenciar todas as instâncias
const socketManager = new SocketManager();
export default socketManager;