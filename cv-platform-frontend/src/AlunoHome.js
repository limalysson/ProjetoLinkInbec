import React from 'react';
import { useNavigate } from 'react-router-dom';

function AlunoHome() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/aluno');
    };

    return (
        <main className="home-login-options-container">
            <header className="admin-header-row">
                <h1>Painel de Vagas</h1>
                <button
                    className="nav-button logout-button"
                    style={{ background: '#c0392b', marginLeft: '16px' }}
                    onClick={handleLogout}
                >
                    Sair
                </button>
            </header>
            <section className="home-buttons-group">
                <article className="home-button-card">
                    <header>
                        <h2 className="home-button-title">Currículo</h2>
                    </header>
                    <div className="home-button-separator"></div>
                    <p className="home-button-description">
                        Cadastre seus dados,<br />
                        crie seu currículo e<br />
                        mantenha suas informações<br />
                        sempre atualizadas.<br /><br />
                    </p>
                    <nav>
                        <button
                            className="action-button glass-action-button"
                            onClick={() => navigate('/aluno/curriculo')}
                        >
                            Criar ou Editar Currículo
                        </button>
                    </nav>
                </article>

                <article className="home-button-card">
                    <header>
                        <h2 className="home-button-title">Vagas Disponíveis</h2>
                    </header>
                    <div className="home-button-separator"></div>
                    <p className="home-button-description">
                        Visualize as vagas<br />
                        cadastradas.<br />
                        Candidate-se às que<br />
                        mais lhe interessam.<br /><br />
                    </p>
                    <nav>
                        <button
                            className="action-button glass-action-button"
                            onClick={() => navigate('/aluno/vagas')}
                        >
                            Visualizar Vagas Disponíveis
                        </button>
                    </nav>
                </article>
            </section>
        </main>
    );
}

export default AlunoHome;