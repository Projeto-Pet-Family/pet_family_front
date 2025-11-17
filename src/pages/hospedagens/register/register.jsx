import React, { useState } from "react";
import { criarHospedagem } from "../../../api/hospedagem/hospedagem";
import "./register.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    nome: "",
    estado: "",
    numero: "",
    cidade: "",
    rua: "",
    bairro: "",
    cep: "",
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const resposta = await criarHospedagem(formData);
      console.log("Salvo:", resposta);

      alert("Hospedagem registrada com sucesso!");

      // LIMPAR CAMPOS
      setFormData({
        nome: "",
        estado: "",
        numero: "",
        cidade: "",
        rua: "",
        bairro: "",
        cep: "",
      });

    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar hospedagem!");
    }
  }

  return (
    <div className="registration-container">
      <div className="form-header">
        <h1>PetFamily</h1>
        <h2>Insira</h2>
        <h3>Seus dados</h3>
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

        <button type="submit" className="next-button">
          Próximo →
        </button>

      </form>
    </div>
  );
};

export default RegistrationForm;
