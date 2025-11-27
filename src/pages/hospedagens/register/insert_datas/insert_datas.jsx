import './insert_datas.css';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const InsertBasicDatas = () => {
  const [formData, setFormData] = useState({
    nome: "",
    valorDiaria: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cnpj: ""
  });

  useEffect(() => {
    const cachedData = localStorage.getItem('hospedagem_basic_data');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setFormData({
          nome: parsedData.nome || "",
          valorDiaria: parsedData.valorDiaria || "",
          email: parsedData.email || "",
          senha: parsedData.senha || "",
          confirmarSenha: parsedData.confirmarSenha || "",
          cnpj: parsedData.cnpj || ""
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
    
    localStorage.setItem('hospedagem_basic_data', JSON.stringify(newFormData));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // Validação básica antes de prosseguir
      if (formData.senha !== formData.confirmarSenha) {
        alert("As senhas não coincidem!");
        return;
      }

      // Limpar campos após submit (opcional)
      setFormData({
        nome: "",
        valorDiaria: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        cnpj: ""
      });

    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar hospedagem!");
    }
  }

  return (
    <div className="registration-container">
      <section className="section-petfamily">
        <h1>PetFamily</h1>
      </section>
      <div className="form-header">
        <h2>Insira dados básicos da</h2>
        <h3>Hospedagem</h3>
      </div>

      <form className="registration-form" onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label>Nome da hospedagem</label>
          <input 
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Valor diária (R$)</label>
          <input 
            type="number"
            name="valorDiaria"
            value={formData.valorDiaria}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Senha</label>
          <input 
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirmar senha</label>
          <input 
            type="password"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>CNPJ</label>
          <input 
            type="text"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            required
          />
        </div>
        
        <Link to="/insert-address">
          <button type="submit" className="next-button">
            Próximo →
          </button>
        </Link>

      </form>
    </div>
  );
};

export default InsertBasicDatas;