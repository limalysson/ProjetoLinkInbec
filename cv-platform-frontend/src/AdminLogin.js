import React, { useState } from 'react';
import axios from 'axios';
// Importe useNavigate para redirecionamento programático
import { useNavigate } from 'react-router-dom';
import './App.css'; 

function AdminLogin({ setAdminAuthenticated }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); // Hook para redirecionamento

    const handleSubmit = async (e) => {
        console.log('AdminLogin handleSubmit: Função chamada!'); // <-- NOVO LOG
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:3001/api/admin/login', { email, password });
            
            console.log('AdminLogin handleSubmit: Login bem-sucedido! Resposta:', response.data); // <-- NOVO LOG
            setMessage(response.data.message);
            
            localStorage.setItem('adminToken', response.data.token); // Salva o token JWT do admin
            setAdminAuthenticated(true); // Altera o estado no App.js para indicar que o admin está logado

            console.log('AdminLogin handleSubmit: Redirecionando para /admin/dashboard...'); // <-- NOVO LOG
            navigate('/admin/dashboard'); // Redireciona para o painel
        } catch (err) {
            console.error("AdminLogin handleSubmit: Erro no login do admin:", err.response?.data?.message || err.message || err); // <-- NOVO LOG
            setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Login de Administrador</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="adminEmail">E-mail:</label>
                    <input
                        type="email"
                        id="adminEmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@inbec.edu.br"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="adminPassword">Senha:</label>
                    <input
                        type="password"
                        id="adminPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="admin123"
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar como Administrador'}
                </button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default AdminLogin;