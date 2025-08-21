import React, { useEffect, useState } from 'react';
import api from './apiConfig';

function AdminVagasDashboard() {
    const [vagas, setVagas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVagas = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('adminToken');
                const res = await api.get('/api/admin/vagas', {
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

    const handleStatusChange = async (vagaId, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/api/admin/vagas/${vagaId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVagas(vagas => vagas.map(v => v._id === vagaId ? { ...v, status } : v));
        } catch {
            alert('Erro ao alterar status da vaga.');
        }
    };

    // Exemplo de seleção de currículo (ajuste conforme seu fluxo)
    const handleSelecionarCandidato = async (vagaId, curriculoId) => {
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/api/admin/vagas/${vagaId}/selecionar/${curriculoId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Currículo selecionado para a vaga!');
        } catch {
            alert('Erro ao selecionar currículo.');
        }
    };

    if (loading) return <p>Carregando vagas...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="admin-vagas-dashboard">
            <h2>Dashboard de Vagas</h2>
            {vagas.length === 0 && <p>Nenhuma vaga cadastrada.</p>}
            {vagas.map(vaga => (
                <div key={vaga._id} className="vaga-card">
                    <h3>{vaga.titulo} ({vaga.status})</h3>
                    <p><strong>Área:</strong> {vaga.area}</p>
                    <p><strong>Curso:</strong> {vaga.curso}</p>
                    <p><strong>Tipo:</strong> {vaga.tipo}</p>
                    <p><strong>Localização:</strong> {vaga.localizacao}</p>
                    <p><strong>Salário:</strong> {vaga.salario}</p>
                    <p><strong>Contato:</strong> {vaga.contatoEmpresa}</p>
                    <button
                        onClick={() => handleStatusChange(vaga._id, vaga.status === 'ativa' ? 'inativa' : 'ativa')}
                        className="action-button"
                    >
                        {vaga.status === 'ativa' ? 'Desativar' : 'Ativar'}
                    </button>
                    <h4>Candidatos:</h4>
                    <div className="candidatos-list">
                        {vaga.candidatos.length === 0 && <p>Nenhum candidato.</p>}
                        {vaga.candidatos.map(curriculo => (
                            <div key={curriculo._id} className="candidato-card">
                                <p><strong>{curriculo.nomeCompleto}</strong> - {curriculo.curso}</p>
                                <button
                                    onClick={() => handleSelecionarCandidato(vaga._id, curriculo._id)}
                                    className="action-button"
                                >
                                    Selecionar para vaga
                                </button>
                                {/* Adicione mais detalhes do currículo se quiser */}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AdminVagasDashboard;