import "./confirm_datas.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../../../api/api"; // Sua API

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

  // Função para criar o endereço completo na sua API
  const criarEnderecoNaAPI = async (dadosEndereco) => {
    try {
      // Formatar o CEP (remover traço)
      const cepFormatado = dadosEndereco.cep.replace(/\D/g, '');

      // Preparar os dados para enviar para sua API
      const enderecoData = {
        rua: dadosEndereco.rua,
        numero: dadosEndereco.numero,
        complemento: dadosEndereco.complemento || '',
        bairro: dadosEndereco.bairro,
        cidade: dadosEndereco.cidade,
        estado: dadosEndereco.estado.toUpperCase(), // Converte para maiúsculas
        cep: cepFormatado
      };

      console.log("Enviando dados do endereço para API:", enderecoData);

      // Enviar para a nova rota /completo
      const response = await api.post('/enderecos/completo', enderecoData);

      // A resposta deve conter idendereco
      if (response.data && response.data.idendereco) {
        console.log(`Endereço criado com ID: ${response.data.idendereco}`);
        return response.data.idendereco;
      } else {
        throw new Error("ID do endereço não retornado pela API");
      }

    } catch (error) {
      console.error("Erro ao criar endereço na API:", error);

      // Tratamento de erros específicos
      if (error.response) {
        const errorData = error.response.data;
        if (error.response.status === 409) {
          // Endereço já existe - pega o ID do endereço existente
          if (errorData.idendereco) {
            console.log(`Usando endereço existente com ID: ${errorData.idendereco}`);
            return errorData.idendereco;
          }
        }

        throw new Error(`Erro ${error.response.status}: ${errorData.message || 'Erro ao criar endereço'}`);
      } else if (error.request) {
        throw new Error("Erro de conexão com o servidor");
      } else {
        throw error;
      }
    }
  };

  const handleConfirmar = async () => {
    try {
      setLoading(true);

      // Validar se todos os dados necessários estão presentes
      const requiredBasic = ['nome', 'valorDiaria', 'email', 'senha', 'cnpj'];
      const missingBasic = requiredBasic.filter(field => !dadosHospedagem[field]);

      if (missingBasic.length > 0) {
        alert("Por favor, preencha todos os dados básicos antes de confirmar!");
        setLoading(false);
        return;
      }

      const requiredAddress = ['rua', 'estado', 'numero', 'cidade', 'bairro', 'cep'];
      const missingAddress = requiredAddress.filter(field => !dadosEndereco[field]);

      if (missingAddress.length > 0) {
        alert("Por favor, preencha todos os dados de endereço antes de confirmar!");
        setLoading(false);
        return;
      }

      // Criar o endereço completo na sua API
      const enderecoId = await criarEnderecoNaAPI(dadosEndereco);

      // Preparar dados para a hospedagem com o ID do endereço criado
      const hospedagemData = {
        nome: dadosHospedagem.nome,
        idendereco: enderecoId,
        valor_diaria: parseFloat(dadosHospedagem.valorDiaria),
        email: dadosHospedagem.email,
        senha: dadosHospedagem.senha,
        telefone: dadosHospedagem.telefone || "",
        cnpj: dadosHospedagem.cnpj
      };

      console.log("Enviando dados da hospedagem para API:", hospedagemData);

      // Fazer requisição para criar a hospedagem na sua API
      await api.post('/hospedagens', hospedagemData);

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
        alert(error.message || "Erro inesperado. Tente novamente.");
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

  // Função para editar dados
  const handleEditarEndereco = () => {
    navigate('/insert-address');
  };

  const handleEditarDadosBasicos = () => {
    navigate('/hospedagem'); // Ajuste para a rota do formulário básico
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
          <div className="section-header">
            <h4 className="section-title">Dados Básicos</h4>
            <button
              type="button"
              className="edit-button"
              onClick={handleEditarDadosBasicos}
            >
              Editar
            </button>
          </div>

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
          <div className="section-header">
            <h4 className="section-title">Endereço</h4>
            <button
              type="button"
              className="edit-button"
              onClick={handleEditarEndereco}
            >
              Editar
            </button>
          </div>

          <div className="data-group">
            <div className="data-row">
              <span className="data-label">Rua:</span>
              <span className="data-value">{dadosEndereco.rua || "Não informado"}</span>
            </div>

            <div className="form-row">
              <div className="data-row half-width">
                <span className="data-label">Número:</span>
                <span className="data-value">{dadosEndereco.numero || "Não informado"}</span>
              </div>

              <div className="data-row half-width">
                <span className="data-label">Complemento:</span>
                <span className="data-value">{dadosEndereco.complemento || "Não informado"}</span>
              </div>
            </div>

            <div className="data-row">
              <span className="data-label">Bairro:</span>
              <span className="data-value">{dadosEndereco.bairro || "Não informado"}</span>
            </div>

            <div className="form-row">
              <div className="data-row half-width">
                <span className="data-label">Cidade:</span>
                <span className="data-value">{dadosEndereco.cidade || "Não informado"}</span>
              </div>

              <div className="data-row half-width">
                <span className="data-label">Estado:</span>
                <span className="data-value">{dadosEndereco.estado || "Não informado"}</span>
              </div>
            </div>

            <div className="data-row">
              <span className="data-label">CEP:</span>
              <span className="data-value">{dadosEndereco.cep || "Não informado"}</span>
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