import React, { useEffect, useState } from 'react';
import api from './apiConfig';
import { useNavigate } from 'react-router-dom';

function VagasList() {
    const [vagas, setVagas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVagas = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const res = await api.get('/api/vagas', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setVagas(res.data.vagas || []);
            } catch (err) {
                setError('Erro ao carregar vagas.');
            } finally {
                setLoading(false);
            }
        };
        fetchVagas();
    }, []);

    const handleCandidatar = async (vagaId) => {
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            await api.post(`/api/vagas/${vagaId}/candidatar`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Candidatura enviada com sucesso!');
        } catch (err) {
            setMessage('Erro ao se candidatar à vaga.');
        }
    };

    if (loading) return <p>Carregando vagas...</p>;

    return (
        <div className="vagas-list">
            <h2>Vagas Disponíveis para seu Curso</h2>
            <button
                type="button"
                className="action-button glass-action-button"
                style={{ marginBottom: 16 }}
                onClick={() => navigate('/aluno/home')}
            >
                Voltar
            </button>
            {message && <div className="admin-popup-message">{message}</div>}
            {vagas.length === 0 && !error && <p>Nenhuma vaga disponível no momento.</p>}
            {error && <p>{error}</p>}
            {vagas.map(vaga => (
                <div key={vaga._id} className="vaga-card">
                    <h3>{vaga.titulo}</h3>
                    <p><strong>Área:</strong> {vaga.area}</p>
                    <p><strong>Descrição:</strong> {vaga.descricao}</p>
                    <p><strong>Requisitos:</strong> {vaga.requisitos}</p>
                    <p><strong>Benefícios:</strong> {vaga.beneficios}</p>
                    <p><strong>Tipo:</strong> {vaga.tipo}</p>
                    <p><strong>Localização:</strong> {vaga.localizacao}</p>
                    <p><strong>Salário:</strong> {vaga.salario}</p>
                    <p><strong>Contato:</strong> {vaga.contatoEmpresa}</p>
                    <button
                        className="action-button"
                        onClick={() => handleCandidatar(vaga._id)}
                    >
                        Candidatar-se
                    </button>
                </div>
            ))}
        </div>
    );
}

export default VagasList;