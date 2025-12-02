import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import api from '../../../api/api.js';
import { saveIdHospedagem } from '../../../utils/authUtils.js'; // Importe a função

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validar campos
      if (!email || !password) {
        setError("Por favor, preencha todos os campos");
        setLoading(false);
        return;
      }

      // Fazer requisição de login
      const response = await api.post('/hospedagens/login', {
        email,
        senha: password
      });

      // Se chegou aqui, login foi bem-sucedido
      const { data } = response.data;

      // Salvar dados do usuário no localStorage/sessionStorage
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', response.data.token || 'authenticated'); // Se sua API retornar token
      } else {
        sessionStorage.setItem('user', JSON.stringify(data));
        sessionStorage.setItem('token', response.data.token || 'authenticated');
      }

      // *** NOVA LINHA ADICIONADA: Salvar o idHospedagem ***
      // Extrair idHospedagem da resposta da API
      const idHospedagem = data.idhospedagem || data.idHospedagem || data.hospedagem?.idhospedagem || data.hospedagem?.idHospedagem || data.id;

      console.log("Tentando extrair idhospedagem:", { 
        dataIdhospedagem: data.idhospedagem,
        dataIdHospedagem: data.idHospedagem,
        dataHospedagemIdhospedagem: data.hospedagem?.idhospedagem,
        dataHospedagemIdHospedagem: data.hospedagem?.idHospedagem,
        dataId: data.id 
      });

      if (idHospedagem) {
        saveIdHospedagem(idHospedagem, rememberMe);
        console.log("idhospedagem salvo com sucesso:", idHospedagem);
      } else {
        console.error("idhospedagem NÃO encontrado na resposta!");
        console.log("Dados completos recebidos:", data);
      }

      // Redirecionar para dashboard ou página principal
      navigate('/home'); // Ajuste a rota conforme necessário

    } catch (error) {
      console.error("Erro no login:", error);
      
      if (error.response) {
        // Erro da API
        const errorMessage = error.response.data.message || "Erro ao fazer login";
        setError(errorMessage);
      } else if (error.request) {
        // Erro de rede
        setError("Erro de conexão. Verifique sua internet e tente novamente.");
      } else {
        // Outros erros
        setError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Verificar se usuário já está logado (opcional)
  // useEffect(() => {
  //   const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  //   if (user) {
  //     navigate('/dashboard');
  //   }
  // }, [navigate]);

  return (
    <div className="login-container">
      <div className="support-backgroud">
        <div className="login-wrapper">
          <h2 className="login-title">Bem vindo, dono de hospedagem</h2>
          <h1 className="login-title-seconde">Entrar</h1>
          
          {/* Mensagem de erro */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="remember-me">Lembrar senha</label>
              </div>
              <a href="#" className="forgot-password">Esqueceu a senha?</a>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="signup-link">
            <a href="/insert-basic-datas"><span>Não tem conta?</span> Clique aqui!</a>
          </div>
        </div>
        
        <div className="login-backgroud">
          <h1>Pet Family</h1>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;