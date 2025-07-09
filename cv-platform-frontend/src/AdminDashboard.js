import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import CurriculumFullDetailsInline from './CurriculumFullDetailsInline';
import { API_BASE_URL } from './apiConfig'; // <-- Adicionar esta linha
import { useNavigate } from 'react-router-dom';

function AdminDashboard({ onAdminLogout }) {
    const navigate = useNavigate();
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPeriodo, setFilterPeriodo] = useState('all');
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [filterCurso, setFilterCurso] = useState('all');

    // Função para buscar os currículos (nenhuma alteração aqui)
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
            // Usa a variável API_BASE_URL
            const response = await axios.get(`${API_BASE_URL}/api/admin/curriculos`, {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            });
            const filteredData = response.data.filter(cur => {
            const statusOk = filterStatus === 'all' || cur.status === filterStatus;
            const periodoOk = filterPeriodo === 'all' || String(cur.periodoAtual) === filterPeriodo;
            const cursoOk = filterCurso === 'all' || cur.curso === filterCurso;
            return statusOk && periodoOk && cursoOk;
        });
            setCurriculums(filteredData);
        } catch (err) {
            console.error("Erro ao carregar currículos para admin:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Não foi possível carregar os currículos.');
        } finally {
            setLoading(false);
        }
    };
    
    // Chamada inicial e ao mudar filtros (nenhuma alteração aqui)
    useEffect(() => {
        fetchCurriculums();
    }, [filterStatus, filterPeriodo, filterCurso]);

    // Função para mudar o status (nenhuma alteração aqui)
    const handleStatusChange = async (id, newStatus) => {
        // ... (seu código existente para mudar status continua igual)
        setMessage('');
        setError('');
        const adminToken = localStorage.getItem('adminToken');

        if (!adminToken) {
            setError('Token de administrador não encontrado. Faça login novamente.');
            return;
        }

        try {
            // Usa a variável API_BASE_URL
            const response = await axios.put(`${API_BASE_URL}/api/admin/curriculos/${id}/status`, { status: newStatus }, {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            });
            setMessage(response.data.message);
            fetchCurriculums();
        } catch (err) {
            console.error("Erro ao mudar status:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Erro ao atualizar o status do currículo.');
        }
    };
    
    // ========================================================================
    // NOVA FUNÇÃO: Para selecionar ou desselecionar um currículo para a empresa
    // ========================================================================
    const handleSelectForCompany = async (id) => {
        setMessage('');
        setError('');
        const adminToken = localStorage.getItem('adminToken');

        try {
            // Usa a variável API_BASE_URL
            const response = await axios.put(`${API_BASE_URL}/api/admin/curriculos/${id}/select`, null, {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            });

            // Atualiza a interface instantaneamente para o usuário
            setCurriculums(currentCurriculums =>
                currentCurriculums.map(cv =>
                    cv._id === id ? { ...cv, selecionadoParaEmpresa: response.data.selecionadoParaEmpresa } : cv
                )
            );
            setMessage('Status de seleção do currículo atualizado!');

        } catch (err) {
            console.error("Erro ao selecionar currículo para empresa:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Erro ao selecionar o currículo.');
        }
    };
    // ========================================================================


    // Função para copiar o link (nenhuma alteração aqui)
    const copyLandingPageLink = () => {
        const selecionados = curriculums.filter(cv => cv.selecionadoParaEmpresa);
        if (selecionados.length === 0) {
            setMessage('Nenhum currículo selecionado!');
            return;
        }
        const ids = selecionados.map(cv => cv._id).join(',');
        // CORREÇÃO: Usa a origem da janela atual para criar o link dinamicamente
        const link = `${window.location.origin}/empresa?ids=${ids}`;
        navigator.clipboard.writeText(link)
            .then(() => setMessage('Link copiado!'))
            .catch(() => setError('Erro ao copiar o link.'));
    };

    // Função de logout do admin
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        if (onAdminLogout) onAdminLogout();
        navigate('/admin', { replace: true });
    };

    // Renderização do componente
    if (loading) {
        return <div className="admin-container">Carregando painel do administrador...</div>;
    }

    if (error) {
        return <div className="admin-container error-message">{error}</div>;
    }

    return (
        <div className="admin-dashboard-container">
            <div className="logout-row">
                {/* Botão de logout no topo */}
                <button
                    className="nav-button logout-button"
                    style={{ marginBottom: 16, background: '#c0392b' }}
                    onClick={handleLogout}
                >
                    Sair
                </button>
            </div>            
            
            <div className="admin-container">
                <h2>Painel Administrativo</h2>

                {/* Filtros e ações não mudam */}
                <div className="admin-actions">
                    <button className="copy-link-button" onClick={copyLandingPageLink}>
                        Gerar Link para Currículos Selecionados
                    </button>
                    <div className="filter-status-group">
                        <div>
                            <label>Status:</label>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="all">Todos</option>
                                <option value="ativo">Ativo</option>
                                <option value="pendente">Pendente</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>
                        <div>
                            <label>Período:</label>
                            <select value={filterPeriodo} onChange={e => setFilterPeriodo(e.target.value)}>
                                <option value="all">Todos</option>
                                <option value="1º Semestre">1º Semestre</option>
                                <option value="2º Semestre">2º Semestre</option>
                                <option value="3º Semestre">3º Semestre</option>
                                <option value="4º Semestre">4º Semestre</option>
                                <option value="5º Semestre">5º Semestre</option>
                                <option value="6º Semestre">6º Semestre</option>
                                <option value="7º Semestre">7º Semestre</option>
                                <option value="8º Semestre">8º Semestre</option>
                                <option value="9º Semestre">9º Semestre</option>
                                <option value="10º Semestre">10º Semestre</option>
                            </select>
                        </div>
                        <div>
                            <label>Curso:</label>
                            <select value={filterCurso} onChange={e => setFilterCurso(e.target.value)}>
                                <option value="all">Todos</option>
                                <option value="Análise e Desenvolvimento de Sistemas">Análise e Desenvolvimento de Sistemas</option>
                                <option value="Engenharia de Software">Engenharia de Software</option>
                                <option value="Engenharia Civil">Engenharia Civil</option>
                                {/* Adicione outros cursos conforme necessário */}
                            </select>
                        </div>
                    </div>
                </div>
                
                {/* Botões Selecionar Todos e Limpar Seleção */}
                <div className="section-save-btn-row" style={{ marginBottom: 12 }}>
                    <button
                        type="button"
                        className="action-button glass-action-button approve-button"
                        onClick={() => {
                            const idsParaSelecionar = curriculums
                                .filter(cv => !cv.selecionadoParaEmpresa)
                                .map(cv => cv._id);
                            Promise.all(idsParaSelecionar.map(id => handleSelectForCompany(id)))
                                .then(() => setMessage('Todos os currículos filtrados foram selecionados!'));
                        }}
                    >
                        Selecionar Todos
                    </button>
                    <button
                        type="button"
                        className="action-button glass-action-button deactivate-button"
                        onClick={() => {
                            const idsParaLimpar = curriculums
                                .filter(cv => cv.selecionadoParaEmpresa)
                                .map(cv => cv._id);
                            Promise.all(idsParaLimpar.map(id => handleSelectForCompany(id)))
                                .then(() => setMessage('Seleção limpa para todos os currículos filtrados!'));
                        }}
                    >
                        Limpar Seleção
                    </button>
                </div>

                {/* Botões de ação em massa */}
                <div className="section-save-btn-row" style={{ marginBottom: 24 }}>
                    <button
                        type="button"
                        className="action-button approve-button"
                        onClick={async () => {
                            const idsParaAtivar = curriculums
                                .filter(cv => cv.status !== 'ativo')
                                .map(cv => cv._id);
                            await Promise.all(idsParaAtivar.map(id => handleStatusChange(id, 'ativo')));
                            setMessage('Todos os currículos filtrados foram aprovados/ativados!');
                        }}
                    >
                        Aprovar/Ativar Todos
                    </button>
                    <button
                        type="button"
                        className="action-button pending-button"
                        onClick={async () => {
                            const idsParaPendente = curriculums
                                .filter(cv => cv.status !== 'pendente')
                                .map(cv => cv._id);
                            await Promise.all(idsParaPendente.map(id => handleStatusChange(id, 'pendente')));
                            setMessage('Todos os currículos filtrados foram marcados como pendente!');
                        }}
                    >
                            <span className="btn-text-desktop">Marcar todos como Pendente</span>
                            <span className="btn-text-mobile">Marcar Pendentes</span>
                    </button>
                    <button
                        type="button"
                        className="action-button deactivate-button"
                        onClick={async () => {
                            const idsParaDesativar = curriculums
                                .filter(cv => cv.status !== 'inativo')
                                .map(cv => cv._id);
                            await Promise.all(idsParaDesativar.map(id => handleStatusChange(id, 'inativo')));
                            setMessage('Todos os currículos filtrados foram desativados!');
                        }}
                    >
                        Desativar Todos
                    </button>
                </div>

                {message && <p className="success-message">{message}</p>}
                
                {curriculums.length === 0 && <p>Nenhum currículo encontrado para os filtros selecionados.</p>}

                <div className="curriculum-admin-list">
                    {curriculums.map(curriculum => (
                        <div 
                            key={curriculum._id} 
                            className={`admin-curriculum-card${expandedCardId === curriculum._id ? ' expanded' : ''}`}
                        >
                            <div className="admin-card-header">
                                <div className="admin-header-info">
                                    <h3>{curriculum.nomeCompleto} - {curriculum.curso} ({curriculum.periodoAtual})</h3>                                
                                    <span className={`status-badge status-${curriculum.status}`}>
                                        {curriculum.status.toUpperCase()}
                                    </span>
                                </div>                            
                            </div> 

                            <div className="admin-email-select-row">
                                <div className="admin-email-row">
                                    <p className="admin-resumo-summary">
                                        <strong>Habilidades:</strong> {curriculum.habilidadesTecnicas || 'Sem habilidades.'}
                                    </p>
                                </div>
                                <div className="admin-select-row">
                                    {curriculum.selecionadoParaEmpresa && (
                                        <p className="selection-indicator">✔ Selecionado</p>
                                    )}                           
                                    <button
                                        onClick={async () => {
                                            // Só mostra o alert se for SELECIONAR (não remover) e status !== 'ativo'
                                            if (!curriculum.selecionadoParaEmpresa && curriculum.status !== 'ativo') {
                                                const statusLabel = curriculum.status === 'pendente' ? 'pendente' : 'inativo';
                                                if (window.confirm(`Esse curriculo está '${statusLabel}'. Deseja ativar/aprovar e selecionar?`)) {
                                                    await handleStatusChange(curriculum._id, 'ativo');
                                                    handleSelectForCompany(curriculum._id);
                                                }
                                                return;
                                            }
                                            // Se já está selecionado, apenas remove sem alert
                                            handleSelectForCompany(curriculum._id);
                                        }}
                                        className={`action-button ${curriculum.selecionadoParaEmpresa ? 'deselect-button' : 'select-button'}`}
                                    >
                                        {curriculum.selecionadoParaEmpresa ? 'Remover' : 'Selecionar'}
                                    </button>
                                </div>
                            </div>

                            <p className="admin-resumo-summary">{curriculum.resumoProfissional || 'Sem resumo.'}</p>
                            
                            <div className="admin-card-actions">
                                {/* ======================================= */}
                                {/* INÍCIO DA ALTERAÇÃO            */}
                                {/* ======================================= */}

                                {/* Linha 1: Botões de Status */}
                                <div className="admin-button-row">
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
                                    <button
                                        onClick={() => setExpandedCardId(expandedCardId === curriculum._id ? null : curriculum._id)}
                                        className="action-button glass-action-button"
                                    >
                                        <span>Ver </span>
                                        <span>Detalhes</span>
                                        <span className="arrow-icon"
                                            style={expandedCardId === curriculum._id ? { transform: 'rotate(90deg)' } : {}}
                                        >
                                            ➔
                                        </span>
                                    </button>
                                </div>
                                
                            </div>

                            {/* Conteúdo expandido não muda */}
                            <div className="expanded-info admin-expanded-info">
                                {expandedCardId === curriculum._id && (
                                    <CurriculumFullDetailsInline curriculum={curriculum} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;