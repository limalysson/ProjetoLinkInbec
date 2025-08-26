require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./src/models/Job');

const mongoURI = process.env.MONGO_URI;

async function seedJobs() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Conectado ao MongoDB!');

        const jobs = [
            {
                titulo: 'Desenvolvedor Frontend',
                area: 'Tecnologia',
                descricao: 'Desenvolvimento de interfaces web modernas.',
                requisitos: 'React, CSS, Git',
                beneficios: 'Vale transporte, Home office',
                tipo: 'CLT',
                localizacao: 'Remoto',
                curso: 'Análise e Desenvolvimento de Sistemas',
                salario: 'R$ 4.000,00',
                contatoEmpresa: 'rh@techsolutions.com',
                status: 'ativo'
            },
            {
                titulo: 'Desenvolvedor Backend',
                area: 'Tecnologia',
                descricao: 'Desenvolvimento de APIs e sistemas escaláveis.',
                requisitos: 'Node.js, MongoDB, Docker',
                beneficios: 'Vale alimentação, Home office',
                tipo: 'CLT',
                localizacao: 'Remoto',
                curso: 'Análise e Desenvolvimento de Sistemas',
                salario: 'R$ 4.500,00',
                contatoEmpresa: 'backend@techsolutions.com',
                status: 'ativo'
            },
            {
                titulo: 'Engenheiro Civil Júnior',
                area: 'Engenharia',
                descricao: 'Acompanhamento de obras e projetos estruturais.',
                requisitos: 'AutoCAD, Excel, Comunicação',
                beneficios: 'Plano de saúde, Vale alimentação',
                tipo: 'Estágio',
                localizacao: 'Fortaleza, CE',
                curso: 'Engenharia Civil',
                salario: 'R$ 2.000,00',
                contatoEmpresa: 'contato@construtoraalpha.com',
                status: 'ativo'
            },
            {
                titulo: 'Projetista Estrutural',
                area: 'Engenharia',
                descricao: 'Elaboração de projetos estruturais residenciais.',
                requisitos: 'SAP2000, AutoCAD, experiência em projetos',
                beneficios: 'Vale transporte, Seguro de vida',
                tipo: 'CLT',
                localizacao: 'Belo Horizonte, MG',
                curso: 'Engenharia Civil',
                salario: 'R$ 5.000,00',
                contatoEmpresa: 'projetos@engenhariabh.com',
                status: 'ativo'
            },
            {
                titulo: 'Analista de Testes',
                area: 'Tecnologia',
                descricao: 'Testes automatizados e manuais em sistemas.',
                requisitos: 'Selenium, Jest, Documentação',
                beneficios: 'Vale refeição, Gympass',
                tipo: 'PJ',
                localizacao: 'São Paulo, SP',
                curso: 'Engenharia de Software',
                salario: 'R$ 4.200,00',
                contatoEmpresa: 'jobs@softtest.com',
                status: 'ativo' // Corrigido para ativa
            },
            {
                titulo: 'Desenvolvedor Mobile',
                area: 'Tecnologia',
                descricao: 'Desenvolvimento de aplicativos Android/iOS.',
                requisitos: 'Flutter, Firebase, UX/UI',
                beneficios: 'Vale alimentação, Horário flexível',
                tipo: 'CLT',
                localizacao: 'Remoto',
                curso: 'Engenharia de Software',
                salario: 'R$ 5.000,00',
                contatoEmpresa: 'mobile@softtest.com',
                status: 'ativo'
            }
        ];

        await Job.deleteMany({});
        await Job.insertMany(jobs);

        console.log('Banco de vagas populado com sucesso!');
        process.exit(0);
    } catch (err) {
        console.error('Erro ao popular o banco de vagas:', err);
        process.exit(1);
    }
}

seedJobs();