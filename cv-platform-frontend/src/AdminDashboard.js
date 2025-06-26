import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Para os estilos gerais

function AdminDashboard() {
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pendente', 'ativo', 'inativo'

    useEffect(() => {
        fetchCurriculums();
    }, [filterStatus]); // Recarrega os currículos quando o filtro de status muda

    const fetchCurriculums = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        const adminToken = localStorage.getItem('adminToken'); // Pega o token do admin

        if (!adminToken) {
            setError('Token de administrador não encontrado. Faça login novamente.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://localhost:3001/api/admin/curriculos', {
                headers: {
                    Authorization: `Bearer ${adminToken}` // Envia o token do admin
                }
            });
            // Filtra os currículos localmente se o filtro não for 'all'
            const filteredData = filterStatus === 'all'
                ? response.data
                : response.data.filter(cur => cur.status === filterStatus);
            
            setCurriculums(filteredData);
        } catch (err) {
            console.error("Erro ao carregar currículos para admin:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Não foi possível carregar os currículos.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setMessage('');
        setError('');
        const adminToken = localStorage.getItem('adminToken');

        if (!adminToken) {
            setError('Token de administrador não encontrado. Faça login novamente.');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3001/api/admin/curriculos/${id}/status`, { status: newStatus }, {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            });
            setMessage(response.data.message);
            fetchCurriculums(); // Recarrega a lista após a atualização
        } catch (err) {
            console.error("Erro ao mudar status:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Erro ao atualizar o status do currículo.');
        }
    };

    const copyLandingPageLink = () => {
        const link = "http://localhost:3000/empresa"; // O link da landing page para as empresas
        navigator.clipboard.writeText(link)
            .then(() => {
                setMessage('Link da Landing Page copiado!');
            })
            .catch(err => {
                console.error('Erro ao copiar link:', err);
                setError('Erro ao copiar o link. Tente manualmente: ' + link);
            });
    };

    if (loading) {
        return <div className="admin-container">Carregando painel do administrador...</div>;
    }

    if (error) {
        return <div className="admin-container error-message">{error}</div>;
    }

    return (
        <div className="admin-container">
            <h2>LinkInbec - Painel de Administração</h2>

            <div className="admin-actions">
                <button onClick={copyLandingPageLink} className="copy-link-button">Copiar Link da Landing Page</button>
                <div className="filter-status-group">
                    <label htmlFor="filterStatus">Filtrar por Status:</label>
                    <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Todos</option>
                        <option value="pendente">Pendente</option>
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                    </select>
                </div>
            </div>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            {curriculums.length === 0 && <p>Nenhum currículo encontrado para o status selecionado.</p>}

            <div className="curriculum-admin-list">
                {curriculums.map(curriculum => (
                    <div key={curriculum._id} className="admin-curriculum-card">
                        <div className="admin-card-header">
                            <h3>{curriculum.nomeCompleto} - {curriculum.curso} ({curriculum.periodoAtual})</h3>
                            <span className={`status-badge status-${curriculum.status}`}>{curriculum.status.toUpperCase()}</span>
                        </div>
                        <p><strong>E-mail:</strong> {curriculum.alunoEmail}</p>
                        <p className="admin-resumo">{curriculum.resumoProfissional || 'Sem resumo.'}</p>
                        <div className="admin-card-actions">
                            <button
                                onClick={() => handleStatusChange(curriculum._id, 'ativo')}
                                disabled={curriculum.status === 'ativo'}
                                className="action-button approve-button"
                            >
                                Aprovar/Ativar
                            </button>
                            <button
                                onClick={() => handleStatusChange(curriculum._id, 'pendente')}
                                disabled={curriculum.status === 'pendente'}
                                className="action-button pending-button"
                            >
                                Marcar como Pendente
                            </button>
                            <button
                                onClick={() => handleStatusChange(curriculum._id, 'inativo')}
                                disabled={curriculum.status === 'inativo'}
                                className="action-button deactivate-button"
                            >
                                Desativar
                            </button>
                            {/* Futuramente: Botão para ver detalhes ou editar o currículo */}
                            {/* <button className="action-button view-details-button">Ver Detalhes</button> */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminDashboard;