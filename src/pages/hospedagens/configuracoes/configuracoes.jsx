import React, { useState } from "react";
import "./configuracoes.css";
import { Link } from "react-router-dom";
import {
  Home,
  Calendar,
  Wrench,
  Users,
  MessageSquare,
  FileText,
  Settings,
  Boxes
} from "lucide-react";

const Configuracoes = () => {
  const [dados, setDados] = useState({
   // tava sem ideia
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
  };

  const salvarAlteracoes = () => {
    alert("Alterações salvas com sucesso!");
    console.log("Dados atualizados:", dados);
  };

  return (
    <div className="container">


      <aside className="sidebar">
        <h2 className="logo">PetFamily</h2>

        <nav className="menu">
          <Link className="menu-item" to="/home"><Home size={16}/> Início</Link>
          <Link className="menu-item" to="/agendamento"><Calendar size={16}/> Agendamentos</Link>
          <Link className="menu-item" to="/servico"><Wrench size={16}/> Serviços</Link>
          <Link className="menu-item" to="/funcionario"><Users size={16}/> Funcionários</Link>
          <Link className="menu-item" to="/mensagens"><MessageSquare size={16}/> Mensagens</Link>
          <Link className="menu-item" to="/interacoes"><Boxes size={16}/> Interações</Link>
          <Link className="menu-item" to="/documentos"><FileText size={16}/> Documentos</Link>
          <Link className="menu-item active" to="/configuracoes"><Settings size={16}/> Configurações</Link>
        </nav>

        <button className="logout">⟵ Sair</button>
      </aside>


      <main className="content">
        <h1>Configurações da Hospedagem</h1>

        <div className="config-card">

          <label>Nome da hospedagem</label>
          <input
            type="text"
            name="nomeHospedagem"
            value={dados.nomeHospedagem}
            onChange={handleChange}
          />

          <label>Endereço</label>
          <input
            type="text"
            name="endereco"
            value={dados.endereco}
            onChange={handleChange}
          />

          <label>Telefone</label>
          <input
            type="text"
            name="telefone"
            value={dados.telefone}
            onChange={handleChange}
          />

          <button className="btn-salvar" onClick={salvarAlteracoes}>
            Salvar alterações
          </button>
        </div>
      </main>

    </div>
  );
};

export default Configuracoes;
