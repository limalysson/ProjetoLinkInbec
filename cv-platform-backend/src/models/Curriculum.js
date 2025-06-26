const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({ /* ... */ });
const LanguageSchema = new mongoose.Schema({ /* ... */ });
const ProjectSchema = new mongoose.Schema({ /* ... */ });

const CurriculumSchema = new mongoose.Schema({
    alunoEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
    nomeCompleto: { type: String, required: true, trim: true },
    dataNascimento: { type: Date, required: true },
    telefone: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },

    // --- NOVO CAMPO PARA A FOTO ---
    fotoUrl: { type: String, trim: true, default: '' }, // URL da foto do perfil

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
});

CurriculumSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Curriculum', CurriculumSchema);