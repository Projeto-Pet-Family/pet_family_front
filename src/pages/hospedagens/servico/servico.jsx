import React, { useState } from "react";
import "./servico.css";
import { Link } from 'react-router-dom';
import { Home, Calendar, Wrench, Users, MessageSquare, FileText, Settings, Boxes, Pencil, Trash2, Plus } from "lucide-react";

const ServicoScreen = () => {
  const [services, setServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

const [popupExcluir, setPopupExcluir] = useState(false);
const [serviceToDelete, setServiceToDelete] = useState(null);


  const openAddModal = () => {
    setEditingService(null);
    setName("");
    setPrice("");
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setName(service.name);
    setPrice(service.price);
    setModalOpen(true);
  };

  const abrirPopupExcluir = (service) => {
  setServiceToDelete(service);
  setPopupExcluir(true);
  };

  const confirmarExclusao = () => {
  setServices(services.filter((s) => s.id !== serviceToDelete.id));
  setPopupExcluir(false);
};


  const saveService = () => {
    if (!name.trim()) return;

    if (editingService) {
      setServices(
        services.map((s) =>
          s.id === editingService.id ? { ...s, name, price } : s
        )
      );
    } else {
      setServices([
        ...services,
        { id: Date.now(), name, price },
      ]);
    }

    setModalOpen(false);
  };


  return (
    <div className="container">
      <aside className="sidebar">
        <h2 className="logo">PetFamily</h2>

        <nav className="menu">
          <Link className="menu-item" to="/home"><Home size={16}/> Início</Link>
          <Link className="menu-item" to="/agendamento"><Calendar size={16}/> Agendamentos</Link>
          <Link className="menu-item active" to="/servico"><Wrench size={16}/> Serviços</Link>
          <Link className="menu-item" to="/funcionario"><Users size={16}/> Funcionários</Link>
          <Link className="menu-item" to="/mensagens"><MessageSquare size={16}/> Mensagens</Link>
          <Link className="menu-item" to="/interacoes"><Boxes size={16}/> Interações</Link>
          <Link className="menu-item" to="/documentos"><FileText size={16}/> Documentos</Link>
          <Link className="menu-item" to="/configuracoes"><Settings size={16}/> Configurações</Link>
        </nav>

        <button className="logout">⟵ Sair</button>
      </aside>

      <main className="content">
        <div className="header">
          <h1>Serviços</h1>
          <button className="add-btn" onClick={openAddModal}>
            <Plus size={18}/> Adicionar Serviço
          </button>
        </div>

        <div className="service-list">
          {services.length === 0 ? (
            <p className="empty">Nenhum serviço cadastrado.</p>
          ) : (
            services.map((service) => (
              <div className="service-card" key={service.id}>
                <h3>{service.name}</h3>
                <p>Preço: R$ {service.price}</p>

                <div className="actions">
                  <button className="edit" onClick={() => openEditModal(service)}>
                    <Pencil size={16}/>
                  </button>
                  <button className="delete" onClick={() => abrirPopupExcluir(service)}>
                  <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {popupExcluir && (
          <div className="modal">
            <div className="modal-box">
              <h2>Excluir Serviço</h2>
              <p>
                Tem certeza que deseja excluir o serviço <strong>{serviceToDelete?.name}</strong>?
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
                placeholder="Preço"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <div className="modal-actions">
                <button className="save" onClick={saveService}>Salvar</button>
                <button className="cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ServicoScreen;
