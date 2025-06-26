import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Certifique-se que useNavigate está importado

function RequestAccess({ setAuthenticatedEmail }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log('RequestAccess handleSubmit: Função chamada!'); // <-- CONSOLE.LOG PARA DEBUG
    e.preventDefault(); // Garanta que esta linha não está comentada!
    setMessage('');
    setError('');
    
    // Verifique o valor do email antes de enviar
    console.log('RequestAccess handleSubmit: Email a ser enviado:', email); // <-- CONSOLE.LOG PARA DEBUG

    try {
      const response = await axios.post('http://localhost:3001/api/alunos/solicitar-acesso', { email });
      console.log('RequestAccess handleSubmit: Requisição POST bem-sucedida!', response.data); // <-- CONSOLE.LOG PARA DEBUG
      setMessage(response.data.message);
      setAuthenticatedEmail(email);
      navigate('/aluno/autenticar'); // Redireciona
    } catch (err) {
      // Importante: logar o erro completo
      console.error("RequestAccess handleSubmit: Erro na requisição:", err); // <-- CONSOLE.LOG PARA DEBUG
      setError(err.response?.data?.message || 'Erro ao solicitar acesso. Tente novamente.');
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
        <button type="submit">Solicitar Código de Acesso</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default RequestAccess;