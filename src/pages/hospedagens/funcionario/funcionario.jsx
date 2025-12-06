import React, { useState } from "react";
import "./funcionario.css";
import { Link } from 'react-router-dom';
import { 
  Home, Calendar, Wrench, Users, MessageSquare, 
  FileText, Settings, Boxes, Plus, User
} from "lucide-react";

const FuncionarioScreen = () => {

  const [funcionarios, setFuncionarios] = useState([
    { id: 1, nome: "Renato Americo da Silva" }
  ]);

const [popupVerMais, setPopupVerMais] = useState(false);
const [funcionarioVerMais, setFuncionarioVerMais] = useState(null);


  const [popupOpen, setPopupOpen] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [novoNome, setNovoNome] = useState("");


  const [popupExcluir, setPopupExcluir] = useState(false);
  const [funcionarioExcluir, setFuncionarioExcluir] = useState(null);


  const abrirPopupEditar = (func) => {
    setFuncionarioSelecionado(func);
    setNovoNome(func.nome);
    setPopupOpen(true);
  };


  const abrirPopupExcluir = (func) => {
    setFuncionarioExcluir(func);
    setPopupExcluir(true);
  };

  const salvarAlteracao = () => {
    setFuncionarios(prev =>
      prev.map(f =>
        f.id === funcionarioSelecionado.id
          ? { ...f, nome: novoNome }
          : f
      )
    );
    setPopupOpen(false);
  };

  const abrirPopupVerMais = (func) => {
  setFuncionarioVerMais(func);
  setPopupVerMais(true);
};


  const confirmarExclusao = () => {
    setFuncionarios(prev => prev.filter(f => f.id !== funcionarioExcluir.id));
    setPopupExcluir(false);
  };

  return (
    <div className="container">

      <aside className="sidebar">
        <h2 className="logo">PetFamily </h2>

        <nav className="menu">
          <Link className="menu-item" to='/home'>
            <Home size={16}/> Início
          </Link>

          <Link className="menu-item" to="/agendamento">
            <Calendar size={16}/> Agendamentos
          </Link>

          <Link className="menu-item" to="/servico">
            <Wrench size={16}/> Serviços
          </Link>

          <Link className="menu-item active" to="/funcionario">
            <Users size={16}/> Funcionários
          </Link>

          <Link className="menu-item" to="/mensagens">
            <MessageSquare size={16}/> Mensagens
          </Link>

          <Link className="menu-item" to="/interacoes">
            <Boxes size={16}/> Interações
          </Link>

          <Link className="menu-item" to="/documento">
            <FileText size={16}/> Documentos
          </Link>

          <Link className="menu-item" to="/configuracao">
            <Settings size={16}/> Configurações
          </Link>
        </nav>

        <button className="logout">⟵ Sair</button>
      </aside>



      <main className="content">
        <div className="header-funcionario">
          <h1>Funcionários</h1>
          <button className="add-btn">
            <Plus size={18}/> Adicionar Funcionário
          </button>
        </div>

        <div className="funcionario-list">
          {funcionarios.map(func => (
            <div className="funcionario-card" key={func.id}>
              <div className="func-info">
                <User size={40} className="avatar" />
                <span className="func-name">{func.nome}</span>
              </div>

              <div className="func-buttons">
                <button className="btn-azul" onClick={() => abrirPopupVerMais(func)}>
                  Ver mais
                </button>

                <button className="btn-vermelho" onClick={() => abrirPopupExcluir(func)}>
                  Excluir
                </button>

                <button className="btn-verde" onClick={() => abrirPopupEditar(func)}>
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {popupVerMais && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Informações do Funcionário</h2>

            <p><strong>Nome:</strong> {funcionarioVerMais?.nome}</p>

            <div className="popup-buttons">
              <button 
                className="cancel"
                onClick={() => setPopupVerMais(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {popupOpen && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Detalhes do Funcionário</h2>

            <label>Nome:</label>
            <input 
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />

            <div className="popup-buttons">
              <button className="save" onClick={salvarAlteracao}>
                Salvar
              </button>
              <button className="cancel" onClick={() => setPopupOpen(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

 
      {popupExcluir && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Excluir Funcionário</h2>
            <p>Tem certeza que deseja excluir <strong>{funcionarioExcluir?.nome}</strong>?</p>

            <div className="popup-buttons">
              <button 
                className="save" 
                onClick={confirmarExclusao}
              >
                Confirmar
              </button>

              <button 
                className="cancel"
                onClick={() => setPopupExcluir(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FuncionarioScreen;
