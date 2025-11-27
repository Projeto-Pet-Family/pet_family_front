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
  });

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
        });
      } catch (error) {
        console.error("Erro ao carregar dados do cache:", error);
      }
    }
  }, []);

  function handleChange(e) {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    
    setFormData(newFormData);
    
    // Salvar no cache automaticamente a cada alteração
    localStorage.setItem('hospedagem_address_data', JSON.stringify(newFormData));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // Validação básica antes de prosseguir
      if (!formData.rua || !formData.estado || !formData.numero || !formData.cidade || !formData.bairro || !formData.cep) {
        alert("Por favor, preencha todos os campos!");
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

        <div className="form-group two-thirds-width">
          <label>Rua</label>
          <input 
            type="text"
            name="rua"
            value={formData.rua}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group two-thirds-width">
            <label>Estado</label>
            <input 
              type="text"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group one-third-width">
            <label>Número</label>
            <input 
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group half-width">
          <label>Cidade</label>
          <input 
            type="text"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label>Bairro</label>
            <input 
              type="text"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>CEP</label>
            <input 
              type="text"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <Link to='/confirm-datas'>
          <button type="submit" className="next-button">
            Próximo →
          </button>
        </Link>

      </form>
    </div>
  );
};

export default InsertAddress;