import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Certifique-se que useNavigate está importado
import { API_BASE_URL } from './apiConfig'; // <-- Adicionar esta linha

function RequestAccess({ setAuthenticatedEmail }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // NOVO: Redireciona se já estiver autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/aluno/curriculo', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    console.log('RequestAccess handleSubmit: Função chamada!'); // <-- CONSOLE.LOG PARA DEBUG
    e.preventDefault(); // Garanta que esta linha não está comentada!
    setMessage('');
    setError('');
    setLoading(true);

    // Verifique o valor do email antes de enviar
    console.log('RequestAccess handleSubmit: Email a ser enviado:', email); // <-- CONSOLE.LOG PARA DEBUG

    try {
      // CORREÇÃO: Adiciona "const response =" para capturar o resultado da chamada.
      const response = await axios.post(`${API_BASE_URL}/api/alunos/solicitar-acesso`, { email });
      console.log('RequestAccess handleSubmit: Requisição POST bem-sucedida!', response.data); // <-- CONSOLE.LOG PARA DEBUG
      setMessage(response.data.message || 'Código de acesso enviado para o seu email!');
      setSuccess(true);
      setAuthenticatedEmail(email);
      navigate('/aluno/autenticar'); // Redireciona
    } catch (err) {
      // Importante: logar o erro completo
      console.error("RequestAccess handleSubmit: Erro na requisição:", err); // <-- CONSOLE.LOG PARA DEBUG
      setError(err.response?.data?.message || 'Erro ao solicitar acesso. Tente novamente.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Acessar Plataforma de Currículos</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">E-mail Institucional:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@inbec.edu.br"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Solicitar Código de Acesso'}
        </button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default RequestAccess;