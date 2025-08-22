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
  <div className="admin-dashboard-container">
    <div className="admin-container">
      <div className="admin-header-group">
        <div className="admin-header-row">
          <h2>Painel de Vagas</h2>
          {/* Adicione botões de navegação se necessário */}
        </div>
        <div className="admin-actions">
          {/* Adicione filtros e ações aqui, se houver */}
        </div>
      </div>
      <div className="curriculum-admin-list">
        {vagas.length === 0 && <p>Nenhuma vaga cadastrada.</p>}
        {vagas.map(vaga => (
          <div key={vaga._id} className="admin-curriculum-card admin-job-card">
            <div className="admin-card-header">
              <div className="admin-header-info">
                <h3>{vaga.titulo} ({vaga.status})</h3>
                <span className={`status-badge status-${vaga.status}`}>
                  {vaga.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="admin-resumo-pdf-row">
              <div className="admin-resumo-summary">
                <p><strong>Área:</strong> {vaga.area}</p>
                <p><strong>Curso:</strong> {vaga.curso}</p>
                <p><strong>Tipo:</strong> {vaga.tipo}</p>
                <p><strong>Localização:</strong> {vaga.localizacao}</p>
                <p><strong>Salário:</strong> {vaga.salario}</p>
                <p><strong>Contato:</strong> {vaga.contatoEmpresa}</p>
              </div>
              {/* Adicione ações específicas da vaga, se quiser */}
            </div>
            <div className="admin-card-actions admin-button-row">
              <button
                onClick={() => handleStatusChange(vaga._id, vaga.status === 'ativo' ? 'inativo' : 'ativo')}
                className="action-button"
              >
                {vaga.status === 'ativo' ? 'Desativar' : 'Ativar'}
              </button>
            </div>
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}

export default AdminVagasDashboard;