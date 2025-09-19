import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import CurriculumDetail from './CurriculumDetail';
import CurriculumFullDetailsInline from './CurriculumFullDetailsInline';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.mobile.css';

function CompanyLandingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const idsParam = params.get('ids');
    const selectedIds = idsParam ? idsParam.split(',') : [];

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
                const response = await axios.get('http://localhost:3001/api/curriculos/ativos');
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
    }, []);

    if (!idsParam || selectedIds.length === 0) {
        return (
            <main>
                <section className="company-landing-container error-message">
                    Acesso inválido: nenhum currículo selecionado. Solicite um novo link.
                </section>
            </main>
        );
    }

    const filteredCurriculums = curriculums.filter(curriculum => {
        const matchesId = selectedIds.includes(curriculum._id);
        const matchesPeriod = selectedPeriod
            ? curriculum.periodoAtual?.toLowerCase() === selectedPeriod.toLowerCase()
            : true;
        return matchesId && matchesPeriod;
    });

    const handleViewDetails = (curriculum) => {
        setSelectedCurriculum(curriculum);
    };

    const handleCloseDetails = () => {
        setSelectedCurriculum(null);
    };

    if (loading) {
        return (
            <main>
                <section className="company-landing-container">Carregando currículos...</section>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <section className="company-landing-container error-message">{error}</section>
            </main>
        );
    }

    return (
        <main>
            <section className="company-landing-container">
                <header>
                    <h1>Currículos Selecionados</h1>
                </header>
                {selectedCurriculum ? (
                    <CurriculumDetail curriculum={selectedCurriculum} onClose={handleCloseDetails} />
                ) : (
                    <section className="curriculum-cards-list">
                        {filteredCurriculums.length > 0 ? (
                            filteredCurriculums.map(curriculum => (
                                <article
                                    key={curriculum._id}
                                    className={`curriculum-card-new-layout${expandedCardId === curriculum._id ? ' expanded' : ''}`}
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
                                        {curriculum.pdfUrl ? (
                                            <a
                                                href={`http://localhost:3001${curriculum.pdfUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="details-button-new-layout"
                                                style={{ marginRight: 12, marginTop: 8, display: 'inline-block' }}
                                            >
                                                Visualizar PDF
                                            </a>
                                        ) : (
                                            <button
                                                className="details-button-new-layout"
                                                style={{ marginRight: 12, marginTop: 8, display: 'inline-block', opacity: 0.6, cursor: 'not-allowed' }}
                                                disabled
                                            >
                                                PDF não enviado
                                            </button>
                                        )}
                                        <button
                                            className="details-button-new-layout"
                                            onClick={() => setExpandedCardId(expandedCardId === curriculum._id ? null : curriculum._id)}
                                            aria-expanded={expandedCardId === curriculum._id}
                                            aria-controls={`curriculo-detalhe-${curriculum._id}`}
                                        >
                                            <span>{expandedCardId === curriculum._id ? 'Recolher' : 'Expandir'}</span>
                                            <span>Currículo</span>
                                            <span
                                                className="arrow-icon"
                                                style={{
                                                    transform: expandedCardId === curriculum._id ? 'rotate(180deg) translateY(5px)' : 'translateY(0)'
                                                }}
                                            >
                                                &#x25BC;
                                            </span>
                                        </button>
                                    </div>
                                    <div
                                        className="expanded-info"
                                        id={`curriculo-detalhe-${curriculum._id}`}
                                    >
                                        {expandedCardId === curriculum._id && (
                                            <CurriculumFullDetailsInline curriculum={curriculum} />
                                        )}
                                    </div>
                                </article>
                            ))
                        ) : (
                            <p>Nenhum currículo ativo encontrado com os filtros aplicados.</p>
                        )}
                    </section>
                )}
            </section>
        </main>
    );
}

export default CompanyLandingPage;