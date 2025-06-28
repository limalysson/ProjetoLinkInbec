require('dotenv').config();
const mongoose = require('mongoose');
const Curriculum = require('./src/models/Curriculum');

const mongoURI = process.env.MONGO_URI;

async function seed() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Conectado ao MongoDB!');

        const cursos = [
            'Análise e Desenvolvimento de Sistemas',
            'Engenharia de Software',
            'Engenharia Civil'
        ];

        const periodos = [
            '1º Semestre',
            '2º Semestre',
            '3º Semestre',
            '4º Semestre',
            '5º Semestre',
            '6º Semestre',
            '7º Semestre',
            '8º Semestre',
            '9º Semestre',
            '10º Semestre'
        ];

        const curriculos = Array.from({ length: 10 }, (_, i) => ({
            alunoEmail: `aluno${i + 1}@inbec.edu.br`,
            nomeCompleto: `Aluno Completo ${i + 1}`,
            dataNascimento: new Date(`200${i + 1}-0${(i % 9) + 1}-15`),
            telefone: `(1${i + 1}) 9${i + 1}${i + 1}${i + 1}${i + 1}${i + 1}-${i + 1}${i + 1}${i + 1}${i + 1}`,
            linkedin: `https://linkedin.com/in/aluno${i + 1}`,
            github: `https://github.com/aluno${i + 1}`,
            curso: cursos[i % cursos.length],
            periodoAtual: periodos[i],
            previsaoConclusao: `202${i + 2}-12`,
            experiencias: [
                {
                    empresa: `Empresa XPTO ${i + 1}`,
                    cargo: `Cargo ${i + 1}`,
                    inicio: `202${i}-01`,
                    fim: `202${i}-12`,
                    descricao: `Atuou como ${i % 2 === 0 ? 'desenvolvedor' : 'analista'} em projetos relevantes.`
                },
                {
                    empresa: `Empresa ABC ${i + 1}`,
                    cargo: `Cargo ${i + 1}B`,
                    inicio: `202${i}-02`,
                    fim: `202${i}-11`,
                    descricao: `Responsável por ${i % 2 === 0 ? 'testes' : 'documentação'} e suporte técnico.`
                }
            ],
            habilidadesTecnicas: `Habilidade${i + 1}A, Habilidade${i + 1}B, Habilidade${i + 1}C`,
            idiomas: [
                { idioma: 'Inglês', nivel: 'Avançado' },
                { idioma: 'Espanhol', nivel: 'Básico' },
                { idioma: 'Francês', nivel: 'Intermediário' }
            ],
            habilidadesComportamentais: `Comportamental${i + 1}A, Comportamental${i + 1}B, Comportamental${i + 1}C`,
            projetos: [
                {
                    nome: `Projeto Alpha ${i + 1}`,
                    descricao: `Desenvolvimento de sistema para gestão de processos.`,
                    link: `https://projetoalpha${i + 1}.com`
                },
                {
                    nome: `Projeto Beta ${i + 1}`,
                    descricao: `Implementação de solução web para clientes.`,
                    link: `https://projetobeta${i + 1}.com`
                }
            ],
            resumoProfissional: `Resumo profissional completo do aluno ${i + 1}.`,
            status: i % 2 === 0 ? 'ativo' : 'pendente'
        }));

        await Curriculum.deleteMany({});
        await Curriculum.insertMany(curriculos);

        console.log('Banco populado com sucesso!');
        process.exit(0);
    } catch (err) {
        console.error('Erro ao popular o banco:', err);
        process.exit(1);
    }
}

seed();