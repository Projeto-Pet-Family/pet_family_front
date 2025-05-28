import React from 'react';
import './register.css';


const RegistrationForm = () => {
  return (
    <div className="registration-container">
      <div className="form-header">
        <h1>PetFamily</h1>
        <h2>insira</h2>
        <h3>Seus dados</h3>
      </div>
      
      <form className="registration-form">
        <div className="form-group">
          <label htmlFor="fullName">Nome completo</label>
          <input type="text" id="fullName" />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" />
        </div>
        
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="cpf">CPF</label>
            <input type="text" id="cpf" />
          </div>
          <div className="form-group half-width">
            <label htmlFor="phone">Telefone</label>
            <input type="tel" id="phone" />
          </div>
        </div>
        
        {/* Campos de endereço divididos */}
        <div className="form-row">
          <div className="form-group two-thirds-width">
            <label htmlFor="street">Rua</label>
            <input type="text" id="street" />
          </div>
          <div className="form-group one-third-width">
            <label htmlFor="number">Número</label>
            <input type="text" id="number" />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="neighborhood">Bairro</label>
            <input type="text" id="neighborhood" />
          </div>
          <div className="form-group half-width">
            <label htmlFor="zipCode">CEP</label>
            <input type="text" id="zipCode" />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input type="password" id="password" />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar senha</label>
          <input type="password" id="confirmPassword" />
        </div>
        
        <div className="form-group">
          <label htmlFor="certification">Certificação profissional</label>
          <input type="text" id="certification" />
        </div>
        
        <button type="submit" className="next-button">Próximo →</button>
      </form>
    </div>
  );
};

export default RegistrationForm;