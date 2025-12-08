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
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    idEndereco: null,
    idLogradouro: null,
    idBairro: null,
    idCidade: null,
    idEstado: null,
    idCEP: null
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const id = getIdHospedagem();

      // Buscar hospedagem
      const respHosp = await api.get(`/hospedagens/${id}`);
      const h = respHosp.data;

      // Buscar endereço completo
      const respEnd = await api.get(`/enderecos/${h.idEndereco}`);
      const e = respEnd.data;

      const [
        log,
        bair,
        cid,
        est,
        cep
      ] = await Promise.all([
        api.get(`/logradouros/${e.idLogradouro}`),
        api.get(`/bairros/${e.idBairro}`),
        api.get(`/cidades/${e.idCidade}`),
        api.get(`/estados/${e.idEstado}`),
        api.get(`/ceps/${e.idCEP}`)
      ]);

      setDados({
        nomeHospedagem: h.nome,
        telefone: h.telefone,

        logradouro: log.data.nome,
        numero: e.numero,
        bairro: bair.data.nome,
        cidade: cid.data.nome,
        estado: est.data.sigla,
        cep: cep.data.numero,

        idEndereco: h.idEndereco,
        idLogradouro: e.idLogradouro,
        idBairro: e.idBairro,
        idCidade: e.idCidade,
        idEstado: e.idEstado,
        idCEP: e.idCEP
      });

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
  };

  const salvarAlteracoes = async () => {
    try {
      const id = getIdHospedagem();

      // Atualiza dados da hospedagem
      await api.put(`/hospedagens/${id}`, {
        nome: dados.nomeHospedagem,
        telefone: dados.telefone
      });

      // Atualizar entidades do endereço
      await api.put(`/logradouros/${dados.idLogradouro}`, {
        nome: dados.logradouro
      });

      await api.put(`/bairros/${dados.idBairro}`, {
        nome: dados.bairro
      });

      await api.put(`/cidades/${dados.idCidade}`, {
        nome: dados.cidade
      });

      await api.put(`/estados/${dados.idEstado}`, {
        sigla: dados.estado
      });

      await api.put(`/ceps/${dados.idCEP}`, {
        numero: dados.cep
      });

      // Atualiza tabela endereço
      await api.put(`/enderecos/${dados.idEndereco}`, {
        numero: dados.numero
      });

      alert("Alterações salvas!");

    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
      alert("Erro ao salvar!");
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="container">

      <aside className="sidebar">
        <h2 className="logo">PetFamily</h2>

        <nav className="menu">
          <Link className="menu-item" to="/home"><Home size={16}/> Início</Link>
          <Link className="menu-item" to="/agendamento"><Calendar size={16}/> Agendamentos</Link>
          <Link className="menu-item" to="/servico"><Wrench size={16}/> Serviços</Link>
     {/*      <Link className="menu-item" to="/funcionario"><Users size={16}/> Funcionários</Link> */}
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

          <label>Nome da Hospedagem</label>
          <input name="nomeHospedagem" value={dados.nomeHospedagem} onChange={handleChange} />

          <label>Telefone</label>
          <input name="telefone" value={dados.telefone} onChange={handleChange} />

          <label>Logradouro</label>
          <input name="logradouro" value={dados.logradouro} onChange={handleChange} />

          <label>Número</label>
          <input name="numero" value={dados.numero} onChange={handleChange} />

          <label>Bairro</label>
          <input name="bairro" value={dados.bairro} onChange={handleChange} />

          <label>Cidade</label>
          <input name="cidade" value={dados.cidade} onChange={handleChange} />

          <label>Estado</label>
          <input name="estado" value={dados.estado} onChange={handleChange} />

          <label>CEP</label>
          <input name="cep" value={dados.cep} onChange={handleChange} />

          <button className="btn-salvar" onClick={salvarAlteracoes}>Salvar alterações</button>
        </div>
      </main>

    </div>
  );
};

export default Configuracoes;
