import React, { useState, useEffect } from "react";
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

import api from "../../../api/api.js";
import { getIdHospedagem } from "../../../utils/authUtils.js";

const Configuracoes = () => {
  const [dados, setDados] = useState({
    nomeHospedagem: "",
    telefone: "",
    endereco: "",
    numero: "",
    cep: "",
    idEndereco: null
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const id = getIdHospedagem();

      const hosp = await api.get(`/hospedagens/${id}`);
      const h = hosp.data;

      const end = await api.get(`/enderecos/${h.idEndereco}`);
      const e = end.data;

      setDados({
        nomeHospedagem: h.nome,
        telefone: h.telefone,
        endereco: e.logradouro,
        numero: e.numero,
        cep: e.cep,
        idEndereco: e.idEndereco
      });

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
  };

  const salvarAlteracoes = async () => {
    try {
      const id = getIdHospedagem();

      await api.put(`/hospedagens/${id}`, {
        nome: dados.nomeHospedagem,
        telefone: dados.telefone,
      });

      await api.put(`/enderecos/${dados.idEndereco}`, {
        logradouro: dados.endereco,
        numero: dados.numero,
        cep: dados.cep
      });

      alert("Alterações salvas com sucesso!");
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar alterações");
    }
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

          <label>Número</label>
          <input
            type="text"
            name="numero"
            value={dados.numero}
            onChange={handleChange}
          />

          <label>CEP</label>
          <input
            type="text"
            name="cep"
            value={dados.cep}
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
