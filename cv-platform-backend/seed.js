require('dotenv').config();
const mongoose = require('mongoose');
const Curriculum = require('./src/models/Curriculum');

const mongoURI = process.env.MONGO_URI;

async function seed() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Conectado ao MongoDB!');

        // Exemplo de currículos
        const curriculos = [
            {
                alunoEmail: 'joao@inbec.edu.br',
                nomeCompleto: 'João Silva',
                dataNascimento: new Date('2000-05-10'),
                telefone: '(11) 99999-1111',
                linkedin: 'https://linkedin.com/in/joaosilva',
                github: 'https://github.com/joaosilva',
                curso: 'Engenharia Civil',
                periodoAtual: '5º Período',
                previsaoConclusao: '2025-12',
                experiencias: [
                    {
                        empresa: 'Construtora X',
                        cargo: 'Estagiário',
                        inicio: '2023-01',
                        fim: '2023-12',
                        descricao: 'Atuação em projetos residenciais.'
                    }
                ],
                habilidadesTecnicas: 'AutoCAD, Excel, Projetos',
                idiomas: [
                    { idioma: 'Inglês', nivel: 'Intermediário' }
                ],
                habilidadesComportamentais: 'Trabalho em equipe, Proatividade',
                projetos: [
                    {
                        nome: 'Projeto Estrutural',
                        descricao: 'Desenvolvimento de projeto estrutural para residência.',
                        link: ''
                    }
                ],
                resumoProfissional: 'Estudante dedicado de Engenharia Civil.',
                status: 'ativo'
            },
            {
                alunoEmail: 'maria@inbec.edu.br',
                nomeCompleto: 'Maria Souza',
                dataNascimento: new Date('1999-08-22'),
                telefone: '(21) 98888-2222',
                linkedin: 'https://linkedin.com/in/mariasouza',
                github: 'https://github.com/mariasouza',
                curso: 'Arquitetura',
                periodoAtual: '7º Período',
                previsaoConclusao: '2024-06',
                experiencias: [
                    {
                        empresa: 'ArqDesign',
                        cargo: 'Estagiária',
                        inicio: '2022-03',
                        fim: '',
                        descricao: 'Participação em projetos de interiores.'
                    }
                ],
                habilidadesTecnicas: 'SketchUp, Revit',
                idiomas: [
                    { idioma: 'Espanhol', nivel: 'Básico' }
                ],
                habilidadesComportamentais: 'Criatividade, Comunicação',
                projetos: [],
                resumoProfissional: 'Apaixonada por design e inovação.',
                status: 'ativo'
            },
            {
                alunoEmail: 'carlos@inbec.edu.br',
                nomeCompleto: 'Carlos Pereira',
                dataNascimento: new Date('2001-02-15'),
                telefone: '(31) 97777-3333',
                linkedin: '',
                github: '',
                curso: 'Engenharia Elétrica',
                periodoAtual: '3º Período',
                previsaoConclusao: '2026-07',
                experiencias: [],
                habilidadesTecnicas: 'Matlab, Simulação de circuitos',
                idiomas: [],
                habilidadesComportamentais: 'Foco, Organização',
                projetos: [],
                resumoProfissional: 'Focado em automação e sistemas elétricos.',
                status: 'pendente'
            }
        ];

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