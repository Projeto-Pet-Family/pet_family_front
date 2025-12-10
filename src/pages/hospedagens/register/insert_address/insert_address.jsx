import "./insert_address.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const InsertAddress = () => {
  const [formData, setFormData] = useState({
    rua: "",
    estado: "",
    numero: "",
    cidade: "",
    bairro: "",
    cep: "",
    complemento: "",
  });

  const [loadingCEP, setLoadingCEP] = useState(false);
  const [cepError, setCepError] = useState("");

  // Carregar dados do cache quando o componente montar
  useEffect(() => {
    const cachedData = localStorage.getItem('hospedagem_address_data');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setFormData({
          rua: parsedData.rua || "",
          estado: parsedData.estado || "",
          numero: parsedData.numero || "",
          cidade: parsedData.cidade || "",
          bairro: parsedData.bairro || "",
          cep: parsedData.cep || "",
          complemento: parsedData.complemento || "",
        });
      } catch (error) {
        console.error("Erro ao carregar dados do cache:", error);
      }
    }
  }, []);

  // Função para buscar endereço pelo CEP usando ViaCEP
  const buscarEnderecoPorCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Verifica se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      setCepError("CEP deve conter 8 dígitos");
      return;
    }

    setLoadingCEP(true);
    setCepError("");

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError("CEP não encontrado");
        return;
      }

      // Atualiza os campos com os dados do CEP
      setFormData(prev => ({
        ...prev,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
        // Mantém os valores que o usuário já preencheu
        numero: prev.numero,
        complemento: prev.complemento,
      }));

      // Salva no cache automaticamente
      const newData = {
        ...formData,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
        cep: cep, // Mantém o CEP formatado
      };
      localStorage.setItem('hospedagem_address_data', JSON.stringify(newData));

    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setCepError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setLoadingCEP(false);
    }
  };

  function handleChange(e) {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatação automática do CEP
    if (name === 'cep') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 5) {
        formattedValue = formattedValue.substring(0, 5) + '-' + formattedValue.substring(5, 8);
      }
    }

    const newFormData = {
      ...formData,
      [name]: formattedValue,
    };
    
    setFormData(newFormData);
    
    // Salva no cache automaticamente a cada alteração
    localStorage.setItem('hospedagem_address_data', JSON.stringify(newFormData));
  }

  // Função para lidar com o blur do CEP (quando o usuário sai do campo)
  const handleCEPBlur = () => {
    const cepLimpo = formData.cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarEnderecoPorCEP(formData.cep);
    }
  };

  // Função para limpar o erro do CEP quando o usuário começa a digitar
  const handleCEPChange = (e) => {
    setCepError(""); // Limpa o erro quando o usuário começa a digitar
    handleChange(e);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // Validação básica antes de prosseguir
      const requiredFields = ['rua', 'estado', 'numero', 'cidade', 'bairro', 'cep'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        alert("Por favor, preencha todos os campos obrigatórios!");
        return;
      }

      // Validação do CEP
      const cepLimpo = formData.cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) {
        alert("Por favor, insira um CEP válido com 8 dígitos!");
        return;
      }

      // Limpar campos após submit (opcional)
      setFormData({
        rua: "",
        estado: "",
        numero: "",
        cidade: "",
        bairro: "",
        cep: "",
        complemento: "",
      });

    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar endereço!");
    }
  }

  return (
    <div className="registration-container">
      <section className="section-petfamily">
        <h1>PetFamily</h1>
      </section>
      <div className="form-header">
        <h2>Insira endereço da</h2>
        <h3>Hospedagem</h3>
      </div>

      <form className="registration-form" onSubmit={handleSubmit}>

        {/* Campo CEP primeiro para busca automática */}
        <div className="form-row">
          <div className="form-group">
            <label>CEP *</label>
            <div className="cep-container">
              <input 
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleCEPChange}
                onBlur={handleCEPBlur}
                placeholder="00000-000"
                maxLength="9"
                required
                className={cepError ? 'error' : ''}
                disabled={loadingCEP}
              />
              {loadingCEP && (
                <div className="cep-loading">
                  <span>Buscando...</span>
                </div>
              )}
            </div>
            {cepError && <span className="error-message">{cepError}</span>}
            <small className="cep-help">
              Digite o CEP e os outros campos serão preenchidos automaticamente
            </small>
          </div>
        </div>

        <div className="form-group two-thirds-width">
          <label>Rua *</label>
          <input 
            type="text"
            name="rua"
            value={formData.rua}
            onChange={handleChange}
            required
            disabled={loadingCEP}
          />
        </div>

        <div className="form-row">
          <div className="form-group one-third-width">
            <label>Número *</label>
            <input 
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group two-thirds-width">
            <label>Complemento</label>
            <input 
              type="text"
              name="complemento"
              value={formData.complemento}
              onChange={handleChange}
              placeholder="Apartamento, bloco, etc."
            />
          </div>
        </div>

        <div className="form-group two-thirds-width">
          <label>Bairro *</label>
          <input 
            type="text"
            name="bairro"
            value={formData.bairro}
            onChange={handleChange}
            required
            disabled={loadingCEP}
          />
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label>Cidade *</label>
            <input 
              type="text"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              required
              disabled={loadingCEP}
            />
          </div>

          <div className="form-group half-width">
            <label>Estado *</label>
            <input 
              type="text"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
              disabled={loadingCEP}
              maxLength="2"
              placeholder="SP"
            />
          </div>
        </div>
        
        <div className="navigation-buttons">
          <Link to='/hospedagem' className="back-link">
            ← Voltar
          </Link>
          <Link to='/confirm-datas'>
            <button type="button" className="next-button">
              Próximo →
            </button>
          </Link>
        </div>

      </form>
    </div>
  );
};

export default InsertAddress;