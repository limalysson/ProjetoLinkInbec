import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './apiConfig'; // ajuste o caminho se necessário

function JobForm({ onSuccess, modoEdicao }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        titulo: '',
        area: '',
        descricao: '',
        requisitos: '',
        beneficios: '',
        tipo: '',
        localizacao: '',
        curso: '',
        salario: '',
        contatoEmpresa: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (modoEdicao && id) {
            const token = localStorage.getItem('adminToken');
            api.get(`/api/admin/vagas/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setFormData(res.data.vaga);
            }).catch(() => setError('Erro ao carregar vaga.'));
        }
    }, [modoEdicao, id]);

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');
        try {
            const token = localStorage.getItem('adminToken');
            if (modoEdicao && id) {
                await api.put(`/api/admin/vagas/${id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Vaga editada com sucesso!');
            } else {
                await api.post('/api/admin/vagas', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Vaga cadastrada com sucesso!');
            }
            if (onSuccess) onSuccess();
            navigate('/admin/vagas');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao salvar vaga.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="job-form-container">
            <h2>{modoEdicao ? 'Editar Vaga' : 'Cadastrar Nova Vaga'}</h2>
            {message && <div className="admin-popup-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Título da Vaga:</label>
                    <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Área/Departamento:</label>
                    <input type="text" name="area" value={formData.area} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Descrição:</label>
                    <textarea name="descricao" value={formData.descricao} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Requisitos:</label>
                    <textarea name="requisitos" value={formData.requisitos} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Benefícios:</label>
                    <input type="text" name="beneficios" value={formData.beneficios} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Tipo:</label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                        <option value="" disabled>Selecione</option>
                        <option value="Estágio">Estágio</option>
                        <option value="CLT">CLT</option>
                        <option value="PJ">PJ</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Localização:</label>
                    <input type="text" name="localizacao" value={formData.localizacao} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Curso:</label>
                    <select name="curso" value={formData.curso} onChange={handleChange} required>
                        <option value="" disabled>Selecione o curso</option>
                        <option value="Análise e Desenvolvimento de Sistemas">Análise e Desenvolvimento de Sistemas</option>
                        <option value="Engenharia de Software">Engenharia de Software</option>
                        <option value="Engenharia Civil">Engenharia Civil</option>
                        {/* Adicione outros cursos se necessário */}
                    </select>
                </div>
                <div className="form-group">
                    <label>Salário:</label>
                    <input type="text" name="salario" value={formData.salario} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Contato da Empresa:</label>
                    <input type="text" name="contatoEmpresa" value={formData.contatoEmpresa} onChange={handleChange} />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Cadastrando...' : (modoEdicao ? 'Salvar Alterações' : 'Cadastrar Vaga')}
                </button>
            </form>
        </div>
    );
}

export default JobForm;