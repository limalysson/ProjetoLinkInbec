import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from './apiConfig'; // <-- Adicionar esta linha
import { useNavigate } from 'react-router-dom';

function getResourceUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:3001${path}`;
}

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
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfUrl, setPdfUrl] = useState('');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Efeito para carregar o currículo existente do aluno (se houver)
    useEffect(() => {
        const fetchCurriculo = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/alunos/curriculo`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (data.success && data.curriculo) {
                    const curriculo = { ...data.curriculo };
                    // Corrige o formato da data para yyyy-MM-dd
                    if (curriculo.dataNascimento) {
                        curriculo.dataNascimento = curriculo.dataNascimento.slice(0, 10);
                    }
                    setFormData(curriculo);
                    console.log('curriculo do backend:', curriculo);
                    setPdfUrl(curriculo.pdfUrl || '');
                    // ...outros campos se necessário
                }
            } catch (err) {
                setError('Erro ao carregar currículo.');
            }
        };
        fetchCurriculo();
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

    // --- Lógica para lidar com a seleção do arquivo PDF ---
    const handlePdfChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.type !== "application/pdf") {
        setError("Por favor, selecione um arquivo PDF.");
        setMessage('');
        return;
      }
      setPdfFile(file);
    };

    // --- Função para fazer o upload da foto separadamente ---
    const uploadPhoto = async (token) => {
        if (!selectedFile) {
            return { success: true, message: 'Nenhuma foto selecionada para upload.' };
        }

        const photoFormData = new FormData();
        photoFormData.append('fotoPerfil', selectedFile); // 'fotoPerfil' deve corresponder ao nome no backend (upload.single('fotoPerfil'))

        try {
            const response = await api.post('http://localhost:3001/api/alunos/upload-foto', photoFormData, {
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

    // --- Função para fazer o upload do PDF ---
    const uploadPdf = async (token) => {
        if (!pdfFile) {
            return { success: true, message: 'Nenhum arquivo PDF selecionado para upload.' };
        }

        const pdfFormData = new FormData();
        pdfFormData.append('pdf', pdfFile); // 'pdf' deve corresponder ao nome no backend (upload.single('pdf'))

        try {
            const response = await api.post('http://localhost:3001/api/alunos/upload-pdf', pdfFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // MUITO IMPORTANTE para uploads
                    Authorization: `Bearer ${token}`
                }
            });
            setPdfUrl(`http://localhost:3001${response.data.pdfUrl}`); // Salva a URL completa do PDF
            return { success: true, message: 'Currículo em PDF atualizado com sucesso!' };
        } catch (err) {
            console.error("Erro ao fazer upload do PDF:", err.response || err);
            return { success: false, message: err.response?.data?.message || 'Erro ao fazer upload do PDF.' };
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

            // 2. Tenta fazer o upload do PDF (se um novo PDF foi selecionado)
            const pdfUploadResult = await uploadPdf(token);
            if (!pdfUploadResult.success) {
                setError(pdfUploadResult.message);
                setIsLoading(false);
                return;
            }
            // Se houver uma mensagem do upload do PDF, exibe
            if (pdfUploadResult.message && pdfUploadResult.message !== 'Nenhum arquivo PDF selecionado para upload.') {
                setMessage(prevMsg => (prevMsg ? prevMsg + ' ' : '') + pdfUploadResult.message);
            }

            // 3. Envia os dados do currículo (agora sem a foto no formData, pois ela já foi tratada)
            let response;
            const existingCurriculumId = formData.id; // Supondo que o ID do currículo existente esteja em formData.id
            if (existingCurriculumId) {
                response = await api.put(`${API_BASE_URL}/api/alunos/curriculo/${existingCurriculumId}`, formData, { // <-- Alterar esta linha
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                const { pdfUrl, ...curriculumData } = formData;
                response = await api.post('/api/alunos/curriculo', curriculumData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            setMessage(prevMsg => (prevMsg ? prevMsg + ' ' : '') + response.data.message);

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

            await api.patch('http://localhost:3001/api/alunos/curriculo', sectionData, {
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

    // Função de logout do aluno
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/aluno', { replace: true });
    };

    // Efeito para limpar a mensagem após 3 segundos
    useEffect(() => {
      if (message) {
        const timer = setTimeout(() => setMessage(''), 3000);
        return () => clearTimeout(timer);
      }
    }, [message]);

    return (
        <>
          {(message || error) && (
            <div className={`fixed-toast-notification${error ? ' error' : ''}`}>
              {message || error}
            </div>
          )}
          <main>
      <div className="curriculum-form-container">
        <div className="curriculum-header-row">
          <button
            type="button"
            className="action-button glass-action-button"
            style={{ marginBottom: 16 }}
            onClick={() => navigate('/aluno/home')}
          >
            Voltar
          </button>
          <h1>Meu Currículo</h1>
          <button
            className="nav-button logout-button"
            style={{ marginBottom: 16, background: '#c0392b' }}
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {message && <div className="admin-popup-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          {/* --- Seção de Upload de Foto --- */}
          <section>
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
                            <img src={getResourceUrl(currentPhotoUrl)} alt="Foto Atual" /> {/* <-- Alterar esta linha */}
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
          </section>

          {/* --- Dados Pessoais --- */}
          <section>
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
                        pattern="\(\d{2}\)\s\d{5}-\d{4}"
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
          </section>
                

          {/* --- Dados Acadêmicos --- */}
          <section>
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
          </section>

          {/* --- Experiências Profissionais --- */}
          <section>
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
          </section>

          {/* --- Habilidades --- */}
          <section>
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
          </section>

          {/* --- Idiomas --- */}
          <section>
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
          </section>

          {/* --- Projetos --- */}
          <section>
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
          </section>

          {/* --- Resumo Profissional --- */}
          <section>
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
          </section>

          {/* --- PDF --- */}
          <section>
            <div className="form-group">
                    <label>Currículo em PDF (opcional):</label>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <button
                            type="button"
                            className="action-button glass-action-button"
                            onClick={() => document.getElementById('pdfCurriculo').click()}
                        >
                            Selecionar PDF
                        </button>
                        <input
                            type="file"
                            id="pdfCurriculo"
                            name="pdf"
                            accept="application/pdf"
                            onChange={handlePdfChange}
                            style={{ display: 'none' }}
                        />
                        {pdfFile && <span style={{ marginLeft: 8 }}>{pdfFile.name}</span>}

                        <button
                            type="button"
                            className="action-button glass-action-button"
                            style={{
                                background: pdfUrl ? undefined : "#ccc",
                                color: pdfUrl ? undefined : "#666",
                                cursor: pdfUrl ? "pointer" : "not-allowed"
                            }}
                            onClick={() => {
                                if (pdfUrl) window.open(getResourceUrl(pdfUrl), '_blank');
                            }}
                            disabled={!pdfUrl}
                        >
                            {pdfUrl ? "Visualizar PDF enviado" : "Nenhum arquivo enviado"}
                        </button>

                        <button
                            type="button"
                            className="action-button glass-action-button"
                            style={{ background: "#c0392b", color: "#fff" }}
                            disabled={isLoading}
                            onClick={async () => {
                                if (window.confirm("Deseja remover o PDF enviado?")) {
                                    setIsLoading(true);
                                    setMessage('');
                                    setError('');
                                    const token = localStorage.getItem('token');
                                    try {
                                        await api.delete('http://localhost:3001/api/alunos/pdf', {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        setPdfUrl('');
                                        setMessage('PDF removido com sucesso!');
                                    } catch (err) {
                                        setError(err.response?.data?.message || 'Erro ao remover PDF.');
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }
                            }}
                        >
                            Remover PDF enviado
                        </button>
                    </div>
                </div>
          </section>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Meu Currículo'}
          </button>
          {message && <div className="admin-popup-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </main>
        </>
    );
}

export default CurriculumForm;