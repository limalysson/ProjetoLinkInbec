const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
    empresa: { type: String, required: true },
    cargo: { type: String, required: true },
    inicio: { type: String, required: true },
    fim: { type: String, required: true },
    descricao: { type: String, required: true }
});

const LanguageSchema = new mongoose.Schema({
    idioma: { type: String, required: true },
    nivel: { type: String, required: true }
});

const ProjectSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    link: { type: String, required: true }
});

const CurriculumSchema = new mongoose.Schema({
    alunoEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
    nomeCompleto: { type: String, required: true, trim: true },
    dataNascimento: { type: Date, required: true },
    telefone: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },

    // --- NOVO CAMPO PARA A FOTO ---
    fotoUrl: { type: String, trim: true, default: '' }, // URL da foto do perfil

     // --- NOVO CAMPO PARA O PDF ---
    pdfUrl: { type: String, trim: true, default: '' }, // URL do PDF do currículo

    curso: { type: String, required: true, trim: true },
    periodoAtual: { type: String, required: true, trim: true },
    previsaoConclusao: { type: String, required: true, trim: true },

    experiencias: [ExperienceSchema],
    habilidadesTecnicas: { type: String, trim: true },
    idiomas: [LanguageSchema],
    habilidadesComportamentais: { type: String, trim: true },
    projetos: [ProjectSchema],
    resumoProfissional: { type: String, trim: true, maxlength: 300 },

    status: { type: String, enum: ['ativo', 'pendente', 'inativo'], default: 'pendente' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    selecionadoParaEmpresa: { type: Boolean, default: false, required: true }
});

CurriculumSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Curriculum', CurriculumSchema);