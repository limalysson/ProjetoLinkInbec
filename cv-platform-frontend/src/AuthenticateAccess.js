import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { API_BASE_URL } from './apiConfig';

function AuthenticateAccess({ email, setAuthenticated, setAuthenticatedEmail }) {
  const [tempPassword, setTempPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const currentEmail = email || location.state?.email;

  const handleSubmit = async (e) => {
    console.log('AuthenticateAccess handleSubmit: Função chamada!'); // <-- NOVO LOG
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentEmail) {
        setError('E-mail para autenticação não encontrado. Por favor, volte e solicite um novo código.');
        console.error('AuthenticateAccess handleSubmit: Email de autenticação ausente.');
        return;
    }
    
    console.log('AuthenticateAccess handleSubmit: Tentando autenticar com email:', currentEmail, 'e código:', tempPassword); // <-- NOVO LOG

    try {
      const response = await axios.post(`${API_BASE_URL}/api/alunos/autenticar-acesso`, { email: currentEmail, tempPassword });
      console.log('AuthenticateAccess handleSubmit: Requisição POST bem-sucedida!', response.data); // <-- NOVO LOG
      setMessage(response.data.message);
      localStorage.setItem('token', response.data.token);
      setAuthenticated(true);
      setAuthenticatedEmail(null);
      console.log('AuthenticateAccess handleSubmit: Autenticação concluída. Redirecionando...'); // <-- NOVO LOG
      navigate('/aluno/home');
    } catch (err) {
      console.error("AuthenticateAccess handleSubmit: Erro na requisição:", err.response?.data || err); // <-- NOVO LOG
      setError(err.response?.data?.message || 'Erro ao autenticar. Verifique o código.');
    }
  };

  if (!currentEmail) {
    return (
      <div className="auth-container">
        <p className="error-message">
          Por favor, primeiro solicite o código de acesso na <Link to="/aluno">página de login do aluno</Link>.
        </p>
      </div>
    );
  }

  return (
    <main>
      <div className="auth-container">
        <h1>Verificar Código de Acesso</h1>
        <p>Um código foi gerado para: <strong>{currentEmail}</strong></p>
        <p>Verifique o console do servidor backend para o código de teste.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tempPassword">Código de Acesso:</label>
            <input
              type="text"
              id="tempPassword"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="Digite o código"
              required
            />
          </div>
          <button type="submit">Entrar</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </main>
  );
}

export default AuthenticateAccess;