import { useState } from 'react';
import './login.css';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, cpf, password, rememberMe });
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <h2 className="login-title">Bem vindo dono de hospedagem</h2>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me">Lembrar senha</label>
            </div>
            <a href="#" className="forgot-password">Esqueceu a senha?</a>
          </div>

          <button type="submit" className="login-button">Entrar</button>
        </form>

        <div className="signup-link">
          Não tem conta? <a href="#">Clique aqui!</a>
        </div>

        <div className="social-login">
          <p>Ou entrar com:</p>
          <div className="social-icons">
            <button className="social-button">
              <span className="icon">f</span>
            </button>
            <button className="social-button">
              <span className="icon">G</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}