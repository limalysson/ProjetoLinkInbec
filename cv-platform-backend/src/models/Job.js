const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
    titulo: { type: String, required: true },
    area: { type: String, required: true },
    descricao: { type: String, required: true },
    requisitos: { type: String, required: true },
    beneficios: { type: String },
    tipo: { type: String, required: true }, // Estágio, CLT, PJ, etc
    localizacao: { type: String, required: true },
    curso: { type: String, required: true }, // Curso relacionado
    salario: { type: String },
    contatoEmpresa: { type: String },
    status: { type: String, enum: ['ativo', 'inativo'], default: 'ativo' },
    dataPublicacao: { type: Date, default: Date.now },
    candidatos: [{ type: Schema.Types.ObjectId, ref: 'Curriculum' }] // Array de currículos candidatos
});

module.exports = mongoose.model('Job', JobSchema);