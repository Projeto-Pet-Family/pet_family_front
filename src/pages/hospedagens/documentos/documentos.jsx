import React, { useState } from "react";
import "./documentos.css";
import { Link } from "react-router-dom";
import { Home, Calendar, Wrench, Users, MessageSquare, FileText, Settings, Boxes } from "lucide-react";

const Documentos = () => {
  const [cnpjFile, setCnpjFile] = useState(null);
  const [alvaraFile, setAlvaraFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("CNPJ:", cnpjFile);
    console.log("Alvará:", alvaraFile);
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
          <Link className="menu-item active" to="/documentos"><FileText size={16}/> Documentos</Link>
          <Link className="menu-item" to="/configuracoes"><Settings size={16}/> Configurações</Link>
        </nav>

        <button className="logout">⟵ Sair</button>
      </aside>

      <main className="content">
        <h1>Documentos</h1>

        <form className="documentos-container" onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label>CNPJ da Hospedagem</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setCnpjFile(e.target.files[0])}
            />
          </div>

          <div className="input-group">
            <label>Alvará da Hospedagem</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setAlvaraFile(e.target.files[0])}
            />
          </div>

          <button type="submit" className="save-button">Enviar Documentos</button>
        </form>
      </main>
    </div>
  );
};

export default Documentos;
