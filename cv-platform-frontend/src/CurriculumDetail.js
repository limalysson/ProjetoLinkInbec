import React from 'react';

function CurriculumDetail({ curriculum, onClose }) {
    if (!curriculum) {
        return null; // Não renderiza nada se não houver currículo
    }

    // Função auxiliar para formatar datas (se estiverem vindo como string de data)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            return dateString; // Retorna original se não conseguir formatar
        }
    };

    return (
        <div className="curriculum-detail-overlay">
            <div className="curriculum-detail-modal">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>Detalhes do Currículo</h2>
                
                {/* --- Dados Pessoais --- */}
                <section>
                    <h3>Dados Pessoais</h3>
                    <p><strong>Nome Completo:</strong> {curriculum.nomeCompleto}</p>
                    <p><strong>Data de Nascimento:</strong> {formatDate(curriculum.dataNascimento)}</p>
                    <p><strong>Telefone:</strong> {curriculum.telefone}</p>
                    {curriculum.linkedin && <p><strong>LinkedIn:</strong> <a href={curriculum.linkedin} target="_blank" rel="noopener noreferrer">{curriculum.linkedin}</a></p>}
                    {curriculum.github && <p><strong>Portfólio/GitHub:</strong> <a href={curriculum.github} target="_blank" rel="noopener noreferrer">{curriculum.github}</a></p>}
                </section>

                {/* --- Dados Acadêmicos --- */}
                <section>
                    <h3>Dados Acadêmicos</h3>
                    <p><strong>Curso:</strong> {curriculum.curso}</p>
                    <p><strong>Período/Semestre Atual:</strong> {curriculum.periodoAtual}</p>
                    <p><strong>Previsão de Conclusão:</strong> {curriculum.previsaoConclusao}</p>
                </section>

                {/* --- Resumo Profissional --- */}
                <section>
                    <h3>Resumo Profissional</h3>
                    <p>{curriculum.resumoProfissional}</p>
                </section>

                {/* --- Experiências Profissionais --- */}
                <section>
                    <h3>Experiências Profissionais</h3>
                    {curriculum.experiencias && curriculum.experiencias.length > 0 ? (
                        curriculum.experiencias.map((exp, index) => (
                            <div key={index} className="experience-item">
                                <h4>{exp.cargo} em {exp.empresa}</h4>
                                <p>{exp.inicio} - {exp.fim || 'Atual'}</p>
                                <p>{exp.descricao}</p>
                            </div>
                        ))
                    ) : (
                        <p>Nenhuma experiência profissional informada.</p>
                    )}
                </section>

                {/* --- Habilidades --- */}
                <section>
                    <h3>Habilidades</h3>
                    <p><strong>Técnicas:</strong> {curriculum.habilidadesTecnicas}</p>
                    <p><strong>Comportamentais:</strong> {curriculum.habilidadesComportamentais}</p>
                </section>

                {/* --- Idiomas --- */}
                <section>
                    <h3>Idiomas</h3>
                    {curriculum.idiomas && curriculum.idiomas.length > 0 ? (
                        curriculum.idiomas.map((lang, index) => (
                            <p key={index}><strong>{lang.idioma}:</strong> {lang.nivel}</p>
                        ))
                    ) : (
                        <p>Nenhum idioma informado.</p>
                    )}
                </section>

                {/* --- Projetos --- */}
                <section>
                    <h3>Projetos</h3>
                    {curriculum.projetos && curriculum.projetos.length > 0 ? (
                        curriculum.projetos.map((proj, index) => (
                            <div key={index} className="project-item">
                                <h4>{proj.nome}</h4>
                                <p>{proj.descricao}</p>
                                {proj.link && <p><a href={proj.link} target="_blank" rel="noopener noreferrer">{proj.link}</a></p>}
                            </div>
                        ))
                    ) : (
                        <p>Nenhum projeto informado.</p>
                    )}
                </section>
                
            </div>
        </div>
    );
}

export default CurriculumDetail;