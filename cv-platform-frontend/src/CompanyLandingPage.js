import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Certifique-se de que seu arquivo de estilos está linkado
import CurriculumDetail from './CurriculumDetail'; // Componente para o modal de detalhes do currículo
import CurriculumFullDetailsInline from './CurriculumFullDetailsInline'; // NOVO
import { useLocation, useNavigate } from 'react-router-dom';

function CompanyLandingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const idsParam = params.get('ids');
    const selectedIds = idsParam ? idsParam.split(',') : [];

    // CHAME TODOS OS HOOKS PRIMEIRO
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('');

    const periodOptions = [
        '', '1º Período', '2º Período', '3º Período', '4º Período',
        '5º Período', '6º Período', '7º Período', '8º Período',
        '9º Período', '10º Período'
    ];

    useEffect(() => {
        const fetchCurriculums = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://192.168.1.19:3001/api/curriculos/ativos');
                setCurriculums(response.data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Não foi possível carregar os currículos no momento.');
                setCurriculums([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCurriculums();
    }, []); // Array de dependências vazio para rodar apenas uma vez ao montar o componente    

    // ERRO AO CARREGAR /EMPRESA SEM CURRICULO SELECIONADO
    if (!idsParam || selectedIds.length === 0) {
        return <div className="company-landing-container error-message">Acesso inválido: nenhum currículo selecionado. Solicite um novo link.</div>;
    }

    // Função para filtrar os currículos exibidos
    const filteredCurriculums = curriculums.filter(curriculum => {
        const matchesId = selectedIds.includes(curriculum._id);
        const matchesPeriod = selectedPeriod
            ? curriculum.periodoAtual?.toLowerCase() === selectedPeriod.toLowerCase()
            : true;
        return matchesId && matchesPeriod;
    });

    // Função para mostrar os detalhes do currículo
    const handleViewDetails = (curriculum) => {
        setSelectedCurriculum(curriculum);
    };

    // Função para fechar os detalhes
    const handleCloseDetails = () => {
        setSelectedCurriculum(null);
    };

    // Depois do fetch:
    const curriculumsToShow = selectedIds.length > 0
        ? curriculums.filter(cv => selectedIds.includes(cv._id))
        : curriculums;

    if (loading) {
        return <div className="company-landing-container">Carregando currículos...</div>;
    }

    if (error) {
        return <div className="company-landing-container error-message">{error}</div>;
    }

    return (
        <div className="company-landing-container">
            {/* ... (filters-section) ... */}

            {selectedCurriculum ? (
                // Modal de detalhes completo (se você quiser manter essa funcionalidade à parte)
                <CurriculumDetail curriculum={selectedCurriculum} onClose={handleCloseDetails} />
            ) : (
                <div className="curriculum-cards-list">
                    {filteredCurriculums.length > 0 ? (
                        filteredCurriculums.map(curriculum => (
                            <div
                                key={curriculum._id}
                                className={`curriculum-card-new-layout${expandedCardId === curriculum._id ? ' expanded' : ''}`}
                                // Removido onClick do card para evitar conflito com o botão de expandir
                            >
                                <div className="card-summary-section">
                                    <div className="foto-area">
                                        {curriculum.fotoUrl ? (
                                            <img 
                                                src={`http://localhost:3001${curriculum.fotoUrl}`} 
                                                alt={`Foto de ${curriculum.nomeCompleto}`} 
                                                className="profile-photo"
                                            />
                                        ) : (
                                            <div className="foto-placeholder-card">Sem Foto</div>
                                        )}
                                    </div>
                                    <div className="info-area">
                                        <div className="header-info">
                                            <h3 className="nome-aluno">{curriculum.nomeCompleto}</h3>
                                            <p className="curso-aluno"><strong>Curso:</strong> {curriculum.curso}</p>
                                            <p className="periodo-aluno"><strong>Período:</strong> {curriculum.periodoAtual}</p>
                                        </div>
                                        <p className="descricao-aluno">{curriculum.resumoProfissional || 'Nenhum resumo disponível.'}</p>
                                        <p className="habilidades-aluno">
                                            <strong>Habilidades:</strong> {curriculum.habilidadesTecnicas || 'N/A'}
                                        </p>
                                    </div>
                                    <button
                                        className="details-button-new-layout"
                                        onClick={() => setExpandedCardId(expandedCardId === curriculum._id ? null : curriculum._id)}
                                    >
                                        <span>{expandedCardId === curriculum._id ? 'Recolher' : 'Expandir'}</span>
                                        <span>Currículo</span> {/* Dividido o texto para quebrar */}
                                        <span
                                            className="arrow-icon"
                                            style={{
                                                transform: expandedCardId === curriculum._id ? 'rotate(180deg) translateY(5px)' : 'translateY(0)'
                                            }}
                                        >
                                            &#x25BC; {/* Seta apontando para baixo */}
                                        </span>
                                    </button>
                                </div> {/* Fim card-summary-section */}

                                {/* Conteúdo Expansível: Agora com o currículo completo inline */}
                                <div className="expanded-info">
                                    {expandedCardId === curriculum._id && (
                                        <CurriculumFullDetailsInline curriculum={curriculum} /> /* RENDERIZA AQUI */
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Nenhum currículo ativo encontrado com os filtros aplicados.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default CompanyLandingPage;