import "./confirm_datas.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../../../api/api"; // Ajuste o caminho conforme sua estrutura

const ConfirmDatas = () => {
  const [dadosHospedagem, setDadosHospedagem] = useState({});
  const [dadosEndereco, setDadosEndereco] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  // Carregar dados do cache quando o componente montar
  useEffect(() => {
    const basicData = localStorage.getItem('hospedagem_basic_data');
    const addressData = localStorage.getItem('hospedagem_address_data');

    if (basicData) {
      try {
        setDadosHospedagem(JSON.parse(basicData));
      } catch (error) {
        console.error("Erro ao carregar dados básicos:", error);
      }
    }

    if (addressData) {
      try {
        setDadosEndereco(JSON.parse(addressData));
      } catch (error) {
        console.error("Erro ao carregar dados de endereço:", error);
      }
    }
  }, []);

  const handleConfirmar = async () => {
    try {
      setLoading(true);

      // Validar se todos os dados necessários estão presentes
      if (!dadosHospedagem.nome || !dadosHospedagem.valorDiaria || !dadosHospedagem.email || !dadosHospedagem.senha || !dadosHospedagem.cnpj) {
        alert("Por favor, preencha todos os dados básicos antes de confirmar!");
        setLoading(false);
        return;
      }

      if (!dadosEndereco.rua || !dadosEndereco.estado || !dadosEndereco.numero || !dadosEndereco.cidade || !dadosEndereco.bairro || !dadosEndereco.cep) {
        alert("Por favor, preencha todos os dados de endereço antes de confirmar!");
        setLoading(false);
        return;
      }

      // Preparar dados para a hospedagem com idendereco fixo como 2
      const hospedagemData = {
        nome: dadosHospedagem.nome,
        idendereco: 2, // ID fixo do endereço
        valor_diaria: parseFloat(dadosHospedagem.valorDiaria),
        email: dadosHospedagem.email,
        senha: dadosHospedagem.senha,
        telefone: dadosHospedagem.telefone || "", // Se tiver telefone no cache
        cnpj: dadosHospedagem.cnpj
      };

      // Fazer requisição para criar a hospedagem
      const responseHospedagem = await api.post('/hospedagens', hospedagemData);

      // Se chegou aqui, deu tudo certo - mostrar popup de sucesso
      setShowSuccessPopup(true);
      
      // Limpar o cache após o cadastro bem-sucedido
      localStorage.removeItem('hospedagem_basic_data');
      localStorage.removeItem('hospedagem_address_data');

    } catch (error) {
      console.error("Erro ao cadastrar hospedagem:", error);
      
      if (error.response) {
        // Erro da API
        const errorMessage = error.response.data.message || "Erro ao cadastrar hospedagem";
        alert(`Erro: ${errorMessage}`);
      } else if (error.request) {
        // Erro de rede
        alert("Erro de conexão. Verifique sua internet e tente novamente.");
      } else {
        // Outros erros
        alert("Erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    // Redirecionar para a página de login após fechar o popup
    navigate('/login');
  };

  return (
    <div className="registration-container">
      <section className="section-petfamily">
        <h1>PetFamily</h1>
      </section>
      <div className="form-header">
        <h2>Confirme os dados da</h2>
        <h3>Hospedagem</h3>
      </div>

      <div className="confirmation-form">
        
        {/* Dados Básicos */}
        <div className="data-section">
          <h4 className="section-title">Dados Básicos</h4>
          
          <div className="data-group">
            <div className="data-row">
              <span className="data-label">Nome da Hospedagem:</span>
              <span className="data-value">{dadosHospedagem.nome || "Não informado"}</span>
            </div>
            
            <div className="data-row">
              <span className="data-label">Valor da Diária:</span>
              <span className="data-value">
                {dadosHospedagem.valorDiaria ? `R$ ${parseFloat(dadosHospedagem.valorDiaria).toFixed(2)}` : "Não informado"}
              </span>
            </div>
            
            <div className="data-row">
              <span className="data-label">Email:</span>
              <span className="data-value">{dadosHospedagem.email || "Não informado"}</span>
            </div>

            <div className="data-row">
              <span className="data-label">Telefone:</span>
              <span className="data-value">{dadosHospedagem.telefone || "Não informado"}</span>
            </div>
            
            <div className="data-row">
              <span className="data-label">CNPJ:</span>
              <span className="data-value">{dadosHospedagem.cnpj || "Não informado"}</span>
            </div>
          </div>
        </div>

        {/* Dados de Endereço */}
        <div className="data-section">
          <h4 className="section-title">Endereço</h4>
          
          <div className="data-group">
            <div className="data-row">
              <span className="data-label">Rua:</span>
              <span className="data-value">{dadosEndereco.rua || "Não informado"}</span>
            </div>
            
            <div className="form-row">
              <div className="data-row half-width">
                <span className="data-label">Estado:</span>
                <span className="data-value">{dadosEndereco.estado || "Não informado"}</span>
              </div>
              
              <div className="data-row one-third-width">
                <span className="data-label">Número:</span>
                <span className="data-value">{dadosEndereco.numero || "Não informado"}</span>
              </div>
            </div>
            
            <div className="data-row">
              <span className="data-label">Cidade:</span>
              <span className="data-value">{dadosEndereco.cidade || "Não informado"}</span>
            </div>
            
            <div className="form-row">
              <div className="data-row half-width">
                <span className="data-label">Bairro:</span>
                <span className="data-value">{dadosEndereco.bairro || "Não informado"}</span>
              </div>
              
              <div className="data-row">
                <span className="data-label">CEP:</span>
                <span className="data-value">{dadosEndereco.cep || "Não informado"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={handleConfirmar} 
            className="confirm-button"
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Confirmar Cadastro"}
          </button>
        </div>

      </div>

      {/* Popup de Sucesso */}
      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="success-popup">
            <div className="popup-icon">✓</div>
            <h3 className="popup-title">Cadastro Realizado com Sucesso!</h3>
            <p className="popup-message">
              Sua hospedagem foi cadastrada com sucesso. 
              Agora você pode fazer login e começar a usar a plataforma.
            </p>
            <button 
              onClick={handlePopupClose}
              className="popup-button"
            >
              Fazer Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmDatas;