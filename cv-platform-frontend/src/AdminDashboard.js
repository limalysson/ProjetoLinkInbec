import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
// REMOVIDO: import CurriculumDetail from './CurriculumDetail'; // Não usaremos mais o modal aqui
import CurriculumFullDetailsInline from './CurriculumFullDetailsInline'; // NOVO: Importar para expansão inline

function AdminDashboard() {
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPeriodo, setFilterPeriodo] = useState('all');
    // REMOVIDO: const [selectedCurriculumForModal, setSelectedCurriculumForModal] = useState(null); // Não usaremos mais o modal
    // NOVO ESTADO: Para controlar qual card está expandido
    const [expandedCardId, setExpandedCardId] = useState(null);

    useEffect(() => {
        fetchCurriculums();
    }, [filterStatus, filterPeriodo]);

    const fetchCurriculums = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        const adminToken = localStorage.getItem('adminToken');

        if (!adminToken) {
            setError('Token de administrador não encontrado. Faça login novamente.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://localhost:3001/api/admin/curriculos', {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            });
            const filteredData = response.data.filter(cur => {
                const statusOk = filterStatus === 'all' || cur.status === filterStatus;
                const periodoOk = filterPeriodo === 'all' || String(cur.periodoAtual) === filterPeriodo;
                return statusOk && periodoOk;
            });
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
        const link = "http://localhost:3000/empresa";
        navigator.clipboard.writeText(link)
            .then(() => {
                setMessage('Link da Landing Page copiado!');
            })
            .catch(err => {
                console.error('Erro ao copiar link:', err);
                setError('Erro ao copiar o link. Tente manualmente: ' + link);
            });
    };

    // REMOVIDO: Funções handleOpenDetailsModal e handleCloseDetailsModal (não usaremos mais o modal)

    if (loading) {
        return <div className="admin-container">Carregando painel do administrador...</div>;
    }

    if (error) {
        return <div className="admin-container error-message">{error}</div>;
    }

    return (
        <div className="admin-container">
            <h2>Painel Administrativo</h2>

            <div className="admin-actions">
                <button onClick={copyLandingPageLink} className="copy-link-button">Copiar Link dos Currículos</button>
                <div className="filter-status-group">
                    <label htmlFor="filterStatus">Filtrar por Status:</label>
                    <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Todos</option>
                        <option value="pendente">Pendente</option>
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                    </select>
                    <label htmlFor="filterPeriodo" style={{marginLeft: '12px'}}>Filtrar por Período:</label>
                    <select id="filterPeriodo" value={filterPeriodo} onChange={(e) => setFilterPeriodo(e.target.value)}>
                        <option value="all">Todos</option>
                        <option value="1">1º</option>
                        <option value="2">2º</option>
                        <option value="3">3º</option>
                        <option value="4">4º</option>
                        <option value="5">5º</option>
                        <option value="6">6º</option>
                        <option value="7">7º</option>
                        <option value="8">8º</option>
                        {/* Adicione mais opções conforme necessário */}
                    </select>
                </div>
            </div>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            {curriculums.length === 0 && <p>Nenhum currículo encontrado para o status selecionado.</p>}

            <div className="curriculum-admin-list">
                {curriculums.map(curriculum => (
                    <div 
                        key={curriculum._id} 
                        className={`admin-curriculum-card${expandedCardId === curriculum._id ? ' expanded' : ''}`} /* Adiciona classe 'expanded' */
                    >
                        <div className="admin-card-header"> {/* NOVO: Div para o cabeçalho do card admin */}
                            <h3>{curriculum.nomeCompleto} - {curriculum.curso} ({curriculum.periodoAtual})</h3>
                            <span className={`status-badge status-${curriculum.status}`}>{curriculum.status.toUpperCase()}</span>
                        </div>
                        <p className="admin-resumo-summary"><strong>E-mail:</strong> {curriculum.alunoEmail}</p> {/* NOVO: Classe para resumo curto */}
                        <p className="admin-resumo-summary">{curriculum.resumoProfissional || 'Sem resumo.'}</p>
                        
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
                            {/* BOTÃO "Ver Detalhes" que agora controlará a expansão */}
                            <button
                                onClick={() => setExpandedCardId(expandedCardId === curriculum._id ? null : curriculum._id)}
                                className="action-button glass-action-button"
                            >
                                <span>Ver </span>
                                <span>Detalhes</span>
                                <span className="arrow-icon"
                                    style={{
                                        transform: expandedCardId === curriculum._id ? 'rotate(180deg) translateY(5px)' : 'translateY(0)'
                                    }}
                                >
                                    &#x25BC;
                                </span>
                            </button>
                        </div>

                        {/* NOVO: Área de conteúdo expandido */}
                        <div className="expanded-info admin-expanded-info"> {/* Usar a mesma classe expanded-info com modificador */}
                            {expandedCardId === curriculum._id && (
                                <CurriculumFullDetailsInline curriculum={curriculum} />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* REMOVIDO: Modal de detalhes (selectedCurriculumForModal) */}
        </div>
    );
}

export default AdminDashboard;