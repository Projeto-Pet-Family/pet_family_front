import React, { useState, useEffect } from "react";
import "./home-page.css";
import { Link } from 'react-router-dom';
import { 
  Home, Calendar, Wrench, Users, MessageSquare, 
  FileText, Settings, Boxes 
} from "lucide-react";
import {useNavigate} from 'react-router-dom';

const HomePage = () => {
  const [hospedagem, setHospedagem] = useState(null);
  const navigate = useNavigate();

  // Carregar dados da hospedagem do cache quando o componente montar
  useEffect(() => {
    const carregarHospedagem = () => {
      try {
        // Tentar carregar do localStorage primeiro (login com "Lembrar senha")
        const userLocal = localStorage.getItem('user');
        if (userLocal) {
          setHospedagem(JSON.parse(userLocal));
          return;
        }

        // Se não encontrar no localStorage, tentar no sessionStorage
        const userSession = sessionStorage.getItem('user');
        if (userSession) {
          setHospedagem(JSON.parse(userSession));
          return;
        }

        // Se não encontrar em nenhum, o usuário não está logado
        console.log("Nenhuma hospedagem encontrada no cache");
      } catch (error) {
        console.error("Erro ao carregar dados da hospedagem:", error);
      }
    };

    carregarHospedagem();
  }, []);

  const handleLogout = () => {
    // Limpar todos os dados de autenticação
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    // Redirecionar para login
    window.location.href = '/login';

    navigate('/login');
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <h2 className="logo">PetFamily</h2>

        <nav className="menu">
          <Link className="menu-item active" to='/home'>
            <Home size={16}/> Início
          </Link>

          <Link className="menu-item" to="/agendamento">
            <Calendar size={16}/> Agendamentos
          </Link>

          <Link className="menu-item" to="/servico">
            <Wrench size={16}/> Serviços
          </Link>

          <Link className="menu-item" to="/funcionario">
            <Users size={16}/> Funcionários
          </Link>

          <Link className="menu-item" to="/mensagens">
            <MessageSquare size={16}/> Mensagens
          </Link>

          <Link className="menu-item" to="/interacao">
            <Boxes size={16}/> Interações
          </Link>

          <Link className="menu-item" to="/documentos">
            <FileText size={16}/> Documentos
          </Link>

          <Link className="menu-item" to="/configuracoes">
            <Settings size={16}/> Configurações
          </Link>
        </nav>

        <button className="logout" onClick={handleLogout}>⟵ Sair</button>
      </aside>

      <main className="content">
        <h1>Início</h1>
        
        {hospedagem ? (
          <div className="welcome-section">
            <h2>Bem-vindo, {hospedagem.nome}!</h2>
            
            <div className="hospedagem-info">
              <div className="info-card">
                <div className="info-grid">
                  
                  <div className="info-item">
                    <strong>Valor da Diária:</strong>
                    <span className="valor-diaria">
                      R$ {parseFloat(hospedagem.valor_diaria || hospedagem.valorDiaria).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="welcome-section">
            <h2>Bem-vindo!</h2>
            <p>Carregando informações da hospedagem...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;