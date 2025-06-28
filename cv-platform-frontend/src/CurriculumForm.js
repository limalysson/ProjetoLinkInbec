import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CurriculumForm() {
    const [formData, setFormData] = useState({
        nomeCompleto: '',
        dataNascimento: '',
        telefone: '',
        linkedin: '',
        github: '',
        // fotoUrl não é gerenciado diretamente aqui, pois é retornado pelo backend após upload
        curso: '',
        periodoAtual: '',
        previsaoConclusao: '',
        experiencias: [{ empresa: '', cargo: '', inicio: '', fim: '', descricao: '' }],
        habilidadesTecnicas: '',
        idiomas: [{ idioma: '', nivel: '' }],
        habilidadesComportamentais: '',
        projetos: [{ nome: '', descricao: '', link: '' }],
        resumoProfissional: '',
    });

    const [selectedFile, setSelectedFile] = useState(null); // Estado para o arquivo de foto selecionado
    const [previewUrl, setPreviewUrl] = useState(''); // Estado para a URL de pré-visualização da foto
    const [currentPhotoUrl, setCurrentPhotoUrl] = useState(''); // Para exibir a foto já salva no currículo

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Efeito para carregar o currículo existente do aluno (se houver)
    useEffect(() => {
        const fetchCurriculum = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Você precisa estar logado para ver ou editar seu currículo.');
                return;
            }

            try {
                const response = await axios.get('http://localhost:3001/api/alunos/meu-curriculo', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data) {
                    console.log("Dados recebidos do backend:", response.data); // <-- Adicione esta linha
                    setFormData({
                        nomeCompleto: response.data.nomeCompleto || '',
                        dataNascimento: response.data.dataNascimento
                            ? response.data.dataNascimento.slice(0, 10)
                            : '',
                        telefone: response.data.telefone || '',
                        linkedin: response.data.linkedin || '',
                        github: response.data.github || '',
                        curso: response.data.curso || '',
                        periodoAtual: response.data.periodoAtual || '',
                        previsaoConclusao: response.data.previsaoConclusao || '',
                        experiencias: response.data.experiencias?.length
                            ? response.data.experiencias
                            : [{ empresa: '', cargo: '', inicio: '', fim: '', descricao: '' }],
                        habilidadesTecnicas: response.data.habilidadesTecnicas || '',
                        habilidadesComportamentais: response.data.habilidadesComportamentais || '',
                        idiomas: response.data.idiomas?.length
                            ? response.data.idiomas
                            : [{ idioma: '', nivel: '' }],
                        projetos: response.data.projetos?.length
                            ? response.data.projetos
                            : [{ nome: '', descricao: '', link: '' }],
                        resumoProfissional: response.data.resumoProfissional || '',
                    });
                    setCurrentPhotoUrl(response.data.fotoUrl || '');
                    setMessage('Currículo carregado com sucesso!');
                }
            } catch (err) {
                // Se o currículo não for encontrado, significa que é o primeiro cadastro
                // Não faz nada, deixa o formulário vazio
            }
        };
        fetchCurriculum();
        // eslint-disable-next-line
    }, []);


    // --- Lógica para lidar com mudanças nos campos do formulário ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleArrayChange = (e, index, type) => {
        const { name, value } = e.target;
        const list = [...formData[type]];
        list[index][name] = value;
        setFormData(prevData => ({
            ...prevData,
            [type]: list
        }));
    };

    const addArrayItem = (type) => {
        setFormData(prevData => {
            const list = [...prevData[type]];
            if (type === 'experiencias') {
                list.push({ empresa: '', cargo: '', inicio: '', fim: '', descricao: '' });
            } else if (type === 'idiomas') {
                list.push({ idioma: '', nivel: '' });
            } else if (type === 'projetos') {
                list.push({ nome: '', descricao: '', link: '' });
            }
            return { ...prevData, [type]: list };
        });
    };

    const removeArrayItem = (index, type) => {
        setFormData(prevData => {
            const list = [...prevData[type]];
            list.splice(index, 1);
            return { ...prevData, [type]: list };
        });
    };

    // --- Lógica para lidar com a seleção do arquivo de foto ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);

        if (file) {
            // Cria uma URL temporária para pré-visualização da imagem
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl('');
        }
    };

    // --- Função para fazer o upload da foto separadamente ---
    const uploadPhoto = async (token) => {
        if (!selectedFile) {
            return { success: true, message: 'Nenhuma foto selecionada para upload.' };
        }

        const photoFormData = new FormData();
        photoFormData.append('fotoPerfil', selectedFile); // 'fotoPerfil' deve corresponder ao nome no backend (upload.single('fotoPerfil'))

        try {
            const response = await axios.post('http://localhost:3001/api/alunos/upload-foto', photoFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // MUITO IMPORTANTE para uploads
                    Authorization: `Bearer ${token}`
                }
            });
            setCurrentPhotoUrl(`http://localhost:3001${response.data.fotoUrl}`); // Salva a URL completa
            setPreviewUrl(''); // Limpa a pré-visualização após o upload
            return { success: true, message: 'Foto de perfil atualizada com sucesso!' };
        } catch (err) {
            console.error("Erro ao fazer upload da foto:", err.response || err);
            return { success: false, message: err.response?.data?.message || 'Erro ao fazer upload da foto.' };
        }
    };

    // --- Lógica para enviar o formulário ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        const token = localStorage.getItem('token');

        if (!token) {
            setError('Você precisa estar logado para salvar seu currículo.');
            setIsLoading(false);
            return;
        }

        try {
            // 1. Tenta fazer o upload da foto primeiro
            const photoUploadResult = await uploadPhoto(token);
            if (!photoUploadResult.success) {
                // Se o upload da foto falhar (e não for apenas "nenhuma foto selecionada"), para por aqui
                setError(photoUploadResult.message);
                setIsLoading(false);
                return;
            }
            // Se houver uma mensagem do upload da foto, exibe
            if (photoUploadResult.message && photoUploadResult.message !== 'Nenhuma foto selecionada para upload.') {
                setMessage(photoUploadResult.message);
            }

            // 2. Envia os dados do currículo (agora sem a foto no formData, pois ela já foi tratada)
            const curriculumResponse = await axios.post('http://localhost:3001/api/alunos/curriculo', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage(prevMsg => (prevMsg ? prevMsg + ' ' : '') + curriculumResponse.data.message);

        } catch (err) {
            console.error("Erro ao salvar currículo:", err.response || err);
            setError(err.response?.data?.message || 'Erro ao salvar currículo. Verifique os dados.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSectionSave = async (sectionFields) => {
        setMessage('');
        setError('');
        setIsLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Você precisa estar logado para salvar seu currículo.');
            setIsLoading(false);
            return;
        }

        try {
            const sectionData = {};
            sectionFields.forEach(field => {
                sectionData[field] = formData[field];
            });

            await axios.patch('http://localhost:3001/api/alunos/curriculo', sectionData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Seção salva com sucesso!');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao salvar a seção.');
        } finally {
            setIsLoading(false);
        }
    };

    function formatPhoneInput(value) {
      // Remove tudo que não for número
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      if (value.length > 6) {
        return `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7,11)}`;
      } else if (value.length > 2) {
        return `(${value.slice(0,2)}) ${value.slice(2)}`;
      } else if (value.length > 0) {
        return `(${value}`;
      }
      return '';
    }

    return (
        <div className="curriculum-form-container">
            <h2>Meu Currículo</h2>
            <form onSubmit={handleSubmit}>
                {/* --- Seção de Upload de Foto --- */}
                <h3>Foto de Perfil</h3>
                <div className="form-group foto-upload-group">
                    <label htmlFor="fotoPerfil" className="upload-button-label">Selecionar Foto</label>
                    <input
                        type="file"
                        id="fotoPerfil"
                        name="fotoPerfil"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleFileChange}
                        style={{ display: 'none' }} // Esconde o input original
                    />
                    {previewUrl && (
                        <div className="photo-preview">
                            <img src={previewUrl} alt="Pré-visualização" />
                            <p>Pré-visualização da nova foto</p>
                        </div>
                    )}
                    {currentPhotoUrl && !previewUrl && (
                        <div className="photo-preview">
                            <img src={currentPhotoUrl} alt="Foto Atual" />
                            <p>Foto de perfil atual</p>
                        </div>
                    )}
                    {!previewUrl && !currentPhotoUrl && (
                        <div className="photo-preview no-photo">
                            <p>Nenhuma foto selecionada.</p>
                        </div>
                    )}
                    {selectedFile && <p className="file-name">Arquivo selecionado: {selectedFile.name}</p>}
                </div>


                {/* --- Dados Pessoais --- */}
                <h3>Dados Pessoais</h3>
                <div className="form-group">
                    <label htmlFor="nomeCompleto">Nome Completo:</label>
                    <input type="text" id="nomeCompleto" name="nomeCompleto" value={formData.nomeCompleto} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="dataNascimento">Data de Nascimento:</label>
                    <input type="date" id="dataNascimento" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="telefone">Telefone (WhatsApp):</label>
                    <input
                        type="tel"
                        id="telefone"
                        name="telefone"
                        value={formatPhoneInput(formData.telefone)}
                        onChange={handleChange}
                        placeholder="Digite somente os numeros do seu telefone"
                        inputMode="numeric"
                        pattern="\d*"
                        />
                </div>
                <div className="form-group">
                    <label htmlFor="linkedin">Link LinkedIn (opcional):</label>
                    <input type="url" id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/seu-perfil" />
                </div>
                <div className="form-group">
                    <label htmlFor="github">Link Portfólio/GitHub (opcional):</label>
                    <input type="url" id="github" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/seu-usuario" />
                </div>
                <div className="section-save-btn-row">
                    <button
                    type="button"
                    className="action-button glass-action-button"
                    disabled={isLoading}
                    onClick={() => handleSectionSave([
                        'nomeCompleto', 'dataNascimento', 'telefone', 'linkedin', 'github'
                    ])}
                    >
                    {isLoading ? 'Salvando...' : 'Salvar Dados Pessoais'}
                    </button>
                </div>
                

                {/* --- Dados Acadêmicos --- */}
                <h3>Dados Acadêmicos</h3>
                <div className="form-group">
                    <div className="form-group">
                        <label htmlFor="curso">Curso:</label>
                        <select
                            id="curso"
                            name="curso"
                            value={formData.curso}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled hidden>Selecione o curso</option>
                            <option value="Análise e Desenvolvimento de Sistemas">Análise e Desenvolvimento de Sistemas</option>
                            <option value="Engenharia de Software">Engenharia de Software</option>
                            <option value="Engenharia Civil">Engenharia Civil</option>                            
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label>Período Atual:</label>
                    <select
                      name="periodoAtual"
                      value={formData.periodoAtual}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled hidden>Selecione o período</option>
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
                    </select></div>
                <div className="form-group">
                    <label htmlFor="previsaoConclusao">Previsão de Conclusão (Mês/Ano):</label>
                    <input type="month" id="previsaoConclusao" name="previsaoConclusao" value={formData.previsaoConclusao} onChange={handleChange} required />
                </div>
                <div className="section-save-btn-row">
                    <button
                        type="button"
                        className="action-button glass-action-button"
                        disabled={isLoading}
                        onClick={() => handleSectionSave([
                            'curso', 'periodoAtual', 'previsaoConclusao'
                        ])}
                    >
                        {isLoading ? 'Salvando...' : 'Salvar Dados Acadêmicos'}
                    </button>
                </div>                

                {/* --- Experiências Profissionais --- */}
                <h3>Experiências Profissionais</h3>
                {formData.experiencias.map((exp, index) => (
                    <div key={index} className="array-item-group">
                        <div className="form-group">
                            <label htmlFor={`empresa-${index}`}>Empresa:</label>
                            <input type="text" id={`empresa-${index}`} name="empresa" value={exp.empresa} onChange={(e) => handleArrayChange(e, index, 'experiencias')} />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`cargo-${index}`}>Cargo:</label>
                            <input type="text" id={`cargo-${index}`} name="cargo" value={exp.cargo} onChange={(e) => handleArrayChange(e, index, 'experiencias')} />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`inicio-${index}`}>Início (Mês/Ano):</label>
                            <input type="month" id={`inicio-${index}`} name="inicio" value={exp.inicio} onChange={(e) => handleArrayChange(e, index, 'experiencias')} />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`fim-${index}`}>Fim (Mês/Ano, deixe em branco se atual):</label>
                            <input type="month" id={`fim-${index}`} name="fim" value={exp.fim} onChange={(e) => handleArrayChange(e, index, 'experiencias')} />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`descricao-${index}`}>Descrição das Responsabilidades:</label>
                            <textarea id={`descricao-${index}`} name="descricao" value={exp.descricao} onChange={(e) => handleArrayChange(e, index, 'experiencias')}></textarea>
                        </div>
                        {formData.experiencias.length > 1 && (
                            <button type="button" onClick={() => removeArrayItem(index, 'experiencias')} className="remove-button">Remover Experiência</button>
                        )}
                    </div>
                ))}

                <div className="section-save-btn-row">
                    <button 
                    type="button" 
                    className="action-button glass-action-button section-btn-left" 
                    onClick={() => addArrayItem('Experiências')}>
                        Adicionar Experiências
                </button>
                <button
                    type="button"
                    className="action-button glass-action-button"
                    disabled={isLoading}
                    onClick={() => handleSectionSave(['Experiências'])}
                >
                    
                    {isLoading ? 'Salvando...' : 'Salvar Experiências'}
                </button>                
                </div>             

                {/* --- Habilidades --- */}
                <h3>Habilidades</h3>
                <div className="form-group">
                    <label htmlFor="habilidadesTecnicas">Habilidades Técnicas (separadas por vírgula):</label>
                    <input type="text" id="habilidadesTecnicas" name="habilidadesTecnicas" value={formData.habilidadesTecnicas} onChange={handleChange} placeholder="Ex: JavaScript, React, Node.js, SQL" />
                </div>
                <div className="form-group">
                    <label htmlFor="habilidadesComportamentais">Habilidades Comportamentais (separadas por vírgula):</label>
                    <input type="text" id="habilidadesComportamentais" name="habilidadesComportamentais" value={formData.habilidadesComportamentais} onChange={handleChange} placeholder="Ex: Comunicação, Trabalho em Equipe, Proatividade" />
                </div>
                
                <div className="section-save-btn-row">
                    <button
                    type="button"
                    className="action-button glass-action-button"
                    disabled={isLoading}
                    onClick={() => handleSectionSave(['habilidadesTecnicas', 'habilidadesComportamentais'])}
                >
                    {isLoading ? 'Salvando...' : 'Salvar Habilidades'}
                </button>
                </div>

                

                {/* --- Idiomas --- */}
                <h3>Idiomas</h3>
                {formData.idiomas.map((idioma, index) => (
                    <div key={index} className="array-item-group">
                        <div className="form-group">
                            <label htmlFor={`idioma-${index}`}>Idioma:</label>
                            <input type="text" id={`idioma-${index}`} name="idioma" value={idioma.idioma} onChange={(e) => handleArrayChange(e, index, 'idiomas')} />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`nivel-${index}`}>Nível:</label>
                            <input type="text" id={`nivel-${index}`} name="nivel" value={idioma.nivel} onChange={(e) => handleArrayChange(e, index, 'idiomas')} placeholder="Ex: Fluente, Intermediário" />
                        </div>
                        {formData.idiomas.length > 1 && (
                            <button type="button" onClick={() => removeArrayItem(index, 'idiomas')} className="remove-button">Remover Idioma</button>
                        )}
                    </div>
                ))}

                <div className="section-save-btn-row">
                    <button 
                    type="button" 
                    className="action-button glass-action-button section-btn-left" 
                    onClick={() => addArrayItem('Idioma')}>
                        Adicionar Idioma
                </button>
                <button
                    type="button"
                    className="action-button glass-action-button"
                    disabled={isLoading}
                    onClick={() => handleSectionSave(['Idioma'])}
                >
                    
                    {isLoading ? 'Salvando...' : 'Salvar Idioma'}
                </button>
                
                </div>                

                {/* --- Projetos --- */}
                <h3>Projetos</h3>
                {formData.projetos.map((projeto, index) => (
                    <div key={index} className="array-item-group">
                        <div className="form-group">
                            <label htmlFor={`projeto-nome-${index}`}>Nome do Projeto:</label>
                            <input type="text" id={`projeto-nome-${index}`} name="nome" value={projeto.nome} onChange={(e) => handleArrayChange(e, index, 'projetos')} />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`projeto-descricao-${index}`}>Descrição:</label>
                            <textarea id={`projeto-descricao-${index}`} name="descricao" value={projeto.descricao} onChange={(e) => handleArrayChange(e, index, 'projetos')}></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor={`projeto-link-${index}`}>Link (opcional):</label>
                            <input type="url" id={`projeto-link-${index}`} name="link" value={projeto.link} onChange={(e) => handleArrayChange(e, index, 'projetos')} placeholder="https://meuprojeto.com" />
                        </div>
                        {formData.projetos.length > 1 && (
                            <button type="button" className="action-button glass-action-button remove-button" onClick={() => removeArrayItem(index, 'projetos')} >Remover Projeto</button>
                        )}
                    </div>
                ))}

                <div className="section-save-btn-row">
                    <button 
                    type="button" 
                    className="action-button glass-action-button section-btn-left" 
                    onClick={() => addArrayItem('projetos')}>
                        Adicionar Projeto
                </button>
                <button
                    type="button"
                    className="action-button glass-action-button"
                    disabled={isLoading}
                    onClick={() => handleSectionSave(['projetos'])}
                >
                    
                    {isLoading ? 'Salvando...' : 'Salvar Projetos'}
                </button>
                
                </div>
                


                {/* --- Resumo Profissional --- */}
                <h3>Resumo Profissional</h3>
                <div className="form-group">
                    <label htmlFor="resumoProfissional">Breve Resumo (aparecerá no card para empresas):</label>
                    <textarea id="resumoProfissional" name="resumoProfissional" value={formData.resumoProfissional} onChange={handleChange} rows="4" maxLength="300" placeholder="Apresente-se em poucas linhas, destacando suas principais qualidades e objetivos profissionais."></textarea>
                <div className="section-save-btn-row">
                    <button
                    type="button"
                    className="action-button glass-action-button"
                    disabled={isLoading}
                    onClick={() => handleSectionSave(['resumoProfissional'])}
                >
                    {isLoading ? 'Salvando...' : 'Salvar Resumo'}
                </button>
                </div>               
                
                </div>
                


                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : 'Salvar Meu Currículo'}
                </button>

                {message && <p className="success-message" aria-live="polite">{message}</p>}
                {error && <p className="error-message" aria-live="assertive">{error}</p>}
            </form>
        </div>
    );
}

export default CurriculumForm;