import React from 'react';
import './App.css'; // Para usar os estilos gerais
import './App.mobile.css';

function CurriculumFullDetailsInline({ curriculum }) {
    if (!curriculum) {
        return null; // Não renderiza nada se não houver currículo
    }

    // Função auxiliar para formatar datas (se estiverem vindo como string de data)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            // Ajusta para o fuso horário local, se necessário, ou use toLocaleDateString diretamente
            return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
        } catch (e) {
            return dateString; // Retorna original se não conseguir formatar
        }
    };

    return (
        <div className="curriculum-full-details-inline">
            {/* As cores de texto para este componente devem ser compatíveis com o fundo transparente */}
            <p><strong>Nome Completo:</strong> {curriculum.nomeCompleto}</p>
            <p><strong>Data de Nascimento:</strong> {formatDate(curriculum.dataNascimento)}</p>
            <p><strong>Telefone:</strong> {curriculum.telefone}</p>
            <p><strong>E-mail:</strong> {curriculum.alunoEmail}</p>
            {curriculum.linkedin && <p><strong>LinkedIn:</strong> <a href={curriculum.linkedin} target="_blank" rel="noopener noreferrer">{curriculum.linkedin}</a></p>}
            {curriculum.github && <p><strong>Portfólio/GitHub:</strong> <a href={curriculum.github} target="_blank" rel="noopener noreferrer">{curriculum.github}</a></p>}

            <section>
                <h3>Dados Acadêmicos</h3>
                <p><strong>Curso:</strong> {curriculum.curso}</p>
                <p><strong>Período/Semestre Atual:</strong> {curriculum.periodoAtual}</p>
                <p><strong>Status:</strong> {curriculum.status}</p>
                <p><strong>Previsão de Conclusão:</strong> {curriculum.previsaoConclusao}</p>
            </section>

            <section>
                <h3>Resumo Profissional</h3>
                <p>{curriculum.resumoProfissional}</p>
            </section>

            <section>
                <h3>Experiências Profissionais</h3>
                {curriculum.experiencias && curriculum.experiencias.length > 0 ? (
                    <ul>
                        {curriculum.experiencias.map((exp, index) => (
                            <li key={index} className="experience-item">
                                <h4>{exp.cargo} em {exp.empresa}</h4>
                                <p>{exp.inicio} - {exp.fim || 'Atual'}</p>
                                <p>{exp.descricao}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nenhuma experiência profissional informada.</p>
                )}
            </section>

            <section>
                <h3>Habilidades</h3>
                <p><strong>Técnicas:</strong> {curriculum.habilidadesTecnicas}</p>
                <p><strong>Comportamentais:</strong> {curriculum.habilidadesComportamentais}</p>
            </section>

            <section>
                <h3>Idiomas</h3>
                {curriculum.idiomas && curriculum.idiomas.length > 0 ? (
                    <ul>
                        {curriculum.idiomas.map((lang, index) => (
                            <li key={index}><strong>{lang.idioma}:</strong> {lang.nivel}</li>
                        ))}
                    </ul>
                ) : (
                    <p>Nenhum idioma informado.</p>
                )}
            </section>

            <section>
                <h3>Projetos</h3>
                {curriculum.projetos && curriculum.projetos.length > 0 ? (
                    <ul>
                        {curriculum.projetos.map((proj, index) => (
                            <li key={index} className="project-item">
                                <h4>{proj.nome}</h4>
                                <p>{proj.descricao}</p>
                                {proj.link && <p><a href={proj.link} target="_blank" rel="noopener noreferrer">{proj.link}</a></p>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nenhum projeto informado.</p>
                )}
            </section>
        </div>
    );
}

export default CurriculumFullDetailsInline;