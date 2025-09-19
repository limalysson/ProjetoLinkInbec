import React, { useEffect, useState } from 'react';
import api from './apiConfig';
import { useNavigate } from 'react-router-dom';

function AdminVagasDashboard() {
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

    const copyCandidatesLink = (candidatos) => {
      if (!candidatos || candidatos.length === 0) {
          setMessage('Nenhum candidato para esta vaga!');
          return;
      }
      const ids = candidatos.join(',');
      const link = `${window.location.origin}/empresa?ids=${ids}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(link)
              .then(() => setMessage('Link copiado!'))
              .catch(() => setError('Erro ao copiar o link.'));
      } else {
          setError(
              <>
                  Copiar para a área de transferência não é suportado neste dispositivo.<br />
                  Copie o link manualmente: <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
              </>
          );
      }
    };    

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
      <main>
        {message && (
          <div className="admin-popup-message">{message}</div>
        )}
        <div className="admin-dashboard-container">
          <div className="admin-container">
            <header className="admin-header-group">
              <div className="admin-header-row">
                <h1>Painel de Vagas</h1>
                <button
                  className="nav-button logout-button"              
                  onClick={() => navigate('/admin')}
                >
                  Voltar
                </button>
              </div>
              <nav className="admin-actions">
                {/* Adicione filtros e ações aqui, se houver */}
              </nav>
            </header>
            <section className="curriculum-admin-list">
              {vagas.length === 0 && <p>Nenhuma vaga cadastrada.</p>}
              {vagas.map(vaga => (
                <article key={vaga._id} className="admin-curriculum-card admin-job-card">
                  <header className="admin-card-header">
                    <div className="admin-header-info">
                      <h2>{vaga.titulo} ({vaga.status})</h2>
                      <span className={`status-badge status-${vaga.status}`}>
                        {vaga.status.toUpperCase()}
                      </span>
                    </div>
                  </header>
                  <section className="admin-resumo-pdf-row">
                    <div className="admin-resumo-summary">
                      <p><strong>Área:</strong> {vaga.area}</p>
                      <p><strong>Curso:</strong> {vaga.curso}</p>
                      <p><strong>Tipo:</strong> {vaga.tipo}</p>
                      <p><strong>Localização:</strong> {vaga.localizacao}</p>
                      <p><strong>Salário:</strong> {vaga.salario}</p>
                      <p><strong>Contato:</strong> {vaga.contatoEmpresa}</p>
                    </div>
                  </section>
                  <footer className="admin-card-actions admin-button-row"
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        marginTop: '8px',
                        width: '100%'
                      }}>
                    <button
                      onClick={() => handleStatusChange(vaga._id, vaga.status === 'ativo' ? 'inativo' : 'ativo')}
                      className="action-button"
                    >
                      {vaga.status === 'ativo' ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      className="action-button"
                      onClick={() => navigate(`/admin/editar-vaga/${vaga._id}`)}
                    >
                      Editar
                    </button>
                  </footer>
                  <h4>Candidatos:</h4>
                  <section className="candidatos-list">
                    {vaga.candidatos.length === 0 && <p>Nenhum candidato.</p>}
                    {vaga.candidatos.length > 0 && (
          <ul>
            {vaga.candidatos.map(curriculo => (
              <li key={curriculo._id}>
                <article className="candidato-card">
                  <p><strong>{curriculo.nomeCompleto}</strong> - {curriculo.curso}</p>
                  <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      marginTop: '8px'
                    }}>
                    <button
                        className="action-button"
                        onClick={() => copyCandidatesLink(vaga.candidatos.map(c => c._id))}
                    >
                        Gerar Link para Currículos dos Candidatos
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  ))}
</section>
          </div>
        </div>
      </main>
    );
}

export default AdminVagasDashboard;