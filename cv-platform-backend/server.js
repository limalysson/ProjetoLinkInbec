require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const connectDB = require('./src/config/db');
const Curriculum = require('./src/models/Curriculum');
const auth = require('./src/middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Importa o módulo fs para criar diretórios

const app = express();
const PORT = process.env.PORT || 3001;

// Conecta ao Banco de Dados
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());

// --- Servir arquivos estáticos (fotos) ---
const uploadsDir = path.join(__dirname, 'uploads');
// Garante que a pasta uploads existe ao iniciar o servidor
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// --- Variáveis de Ambiente Essenciais ---
const FACULDADE_DOMINIO = '@inbec.edu.br';
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_padrao';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// --- Middleware de Autorização para Administradores ---
const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }
    next();
};

// --- Configuração do Multer para Upload de Fotos ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const fotosDir = path.join(__dirname, 'uploads', 'fotos');
        if (!fs.existsSync(fotosDir)) {
            fs.mkdirSync(fotosDir, { recursive: true });
        }
        cb(null, fotosDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limite de 2MB para a foto
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Apenas arquivos de imagem (JPG, JPEG, PNG, GIF) são permitidos!'));
    }
});


// --- ROTAS DA APLICAÇÃO ---

// Rota de Solicitação de Acesso (Login Aluno)
app.post('/api/alunos/solicitar-acesso', async (req, res) => {
    console.log('Backend: Requisição /api/alunos/solicitar-acesso recebida!');
    const { email } = req.body;

    if (!email || !email.endsWith(FACULDADE_DOMINIO)) {
        console.log('Backend: Dominio de email inválido:', email);
        return res.status(400).json({ message: `Por favor, utilize seu e-mail institucional com o domínio ${FACULDADE_DOMINIO}.` });
    }

    try {
        const tempPassword = Math.random().toString(36).slice(2, 8).toUpperCase();
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        if (!app.locals.temporaryPasswords) {
            app.locals.temporaryPasswords = {};
        }
        app.locals.temporaryPasswords[email] = {
            passwordHash: passwordHash,
            createdAt: Date.now()
        };

        console.log(`Backend: Senha temporária gerada para ${email}: ${tempPassword}`);
        console.log('Backend: Enviando resposta de sucesso para /solicitar-acesso.');

        res.status(200).json({ message: 'Um código de acesso foi gerado para seu e-mail (verifique o console do servidor para testes).' });

    } catch (error) {
        console.error('Backend: Erro ao processar /solicitar-acesso:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao gerar o código. Tente novamente mais tarde.' });
    }
});

// Rota para Autenticar Acesso (Login Aluno)
app.post('/api/alunos/autenticar-acesso', async (req, res) => {
    console.log('Backend: Requisição /api/alunos/autenticar-acesso recebida!');
    const { email, tempPassword } = req.body;

    if (!email || !tempPassword) {
        console.log('Backend: Email ou senha temporária ausentes.');
        return res.status(400).json({ message: 'E-mail e código de acesso são obrigatórios.' });
    }

    const storedData = app.locals.temporaryPasswords ? app.locals.temporaryPasswords[email] : null;

    if (!storedData) {
        console.log('Backend: Dados temporários não encontrados para o email ou expirados:', email);
        return res.status(401).json({ message: 'E-mail não encontrado ou código expirado/utilizado.' });
    }

    const FIVE_MINUTES = 5 * 60 * 1000;
    if (Date.now() - storedData.createdAt > FIVE_MINUTES) {
        console.log('Backend: Código expirado para o email:', email);
        delete app.locals.temporaryPasswords[email];
        return res.status(401).json({ message: 'Código de acesso expirado. Por favor, solicite um novo.' });
    }

    const isMatch = await bcrypt.compare(tempPassword, storedData.passwordHash);

    if (!isMatch) {
        console.log('Backend: Código inválido para o email:', email);
        return res.status(401).json({ message: 'Código de acesso inválido.' });
    }

    const token = jwt.sign({ email: email, role: 'aluno' }, JWT_SECRET, { expiresIn: '1h' });

    delete app.locals.temporaryPasswords[email];
    console.log('Backend: Autenticação bem-sucedida para o email:', email, '. Token gerado. Enviando resposta.');
    res.status(200).json({ message: 'Autenticação bem-sucedida!', token: token });
});

// Rota para Salvar/Atualizar Currículo (Aluno)
app.post('/api/alunos/curriculo', auth, async (req, res) => {
    const alunoEmail = req.user.email;
    const curriculumData = req.body;

    try {
        let curriculum = await Curriculum.findOne({ alunoEmail });

        if (curriculum) {
            Object.assign(curriculum, curriculumData);
            curriculum.status = 'pendente';
            await curriculum.save();
            return res.status(200).json({ message: 'Currículo atualizado com sucesso!', curriculum });
        } else {
            curriculum = new Curriculum({
                alunoEmail,
                ...curriculumData,
                status: 'pendente'
            });
            await curriculum.save();
            return res.status(201).json({ message: 'Currículo salvo com sucesso para análise!', curriculum });
        }

    } catch (error) {
        console.error('Backend: Erro ao salvar/atualizar currículo:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao salvar o currículo.' });
    }
});

// Rota para Listar Currículos Ativos (Empresa)
app.get('/api/curriculos/ativos', async (req, res) => {
    try {
        console.log('Backend: Requisição /api/curriculos/ativos recebida!');
        const activeCurriculums = await Curriculum.find({ status: 'ativo' }).select('-__v -createdAt -updatedAt');

        if (activeCurriculums.length === 0) {
            console.log('Backend: Nenhum currículo ativo encontrado.');
            return res.status(404).json({ message: 'Nenhum currículo ativo encontrado no momento.' });
        }

        console.log(`Backend: ${activeCurriculums.length} currículos ativos encontrados.`);
        res.status(200).json(activeCurriculums);

    } catch (error) {
        console.error('Backend: Erro ao buscar currículos ativos:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar currículos.' });
    }
});

// Rota para Buscar Currículo Detalhado por ID (Empresa)
app.get('/api/curriculos/:id', async (req, res) => {
    try {
        console.log(`Backend: Requisição /api/curriculos/:id (${req.params.id}) recebida!`);
        const curriculumId = req.params.id;
        const curriculum = await Curriculum.findById(curriculumId).select('-__v -createdAt -updatedAt');

        if (!curriculum) {
            console.log('Backend: Currículo detalhado não encontrado.');
            return res.status(404).json({ message: 'Currículo não encontrado.' });
        }

        if (curriculum.status !== 'ativo' && curriculum.status !== 'pendente') {
             console.log(`Backend: Acesso negado para currículo ${curriculumId} com status ${curriculum.status}.`);
             return res.status(403).json({ message: 'Acesso negado. Currículo não disponível para visualização.' });
        }

        console.log(`Backend: Currículo ${curriculumId} encontrado e acessível.`);
        res.status(200).json(curriculum);

    } catch (error) {
        console.error('Backend: Erro ao buscar currículo detalhado:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de currículo inválido.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao buscar currículo detalhado.' });
    }
});

// Rota de Login para Administradores
app.post('/api/admin/login', async (req, res) => {
    console.log('Backend: Requisição de login Admin recebida!');
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        console.log('Backend: Credenciais Admin CORRETAS.');
        const token = jwt.sign({ email: email, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
        console.log('Backend: Token JWT de Admin gerado. Enviando resposta.');
        return res.status(200).json({ message: 'Login de administrador bem-sucedido!', token: token });
    } else {
        console.log('Backend: Credenciais Admin INVÁLIDAS.');
        return res.status(401).json({ message: 'Credenciais de administrador inválidas.' });
    }
});

// Rota para listar TODOS os currículos (admin)
app.get('/api/admin/curriculos', auth, authorizeAdmin, async (req, res) => {
    try {
        console.log('Backend: Requisição /api/admin/curriculos recebida!');
        const allCurriculums = await Curriculum.find().select('-__v');
        console.log(`Backend: ${allCurriculums.length} currículos totais encontrados para admin.`);
        res.status(200).json(allCurriculums);
    } catch (error) {
        console.error('Backend: Erro ao buscar todos os currículos (admin):', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar currículos.' });
    }
});

// Rota para alterar o status de um currículo (admin)
app.put('/api/admin/curriculos/:id/status', auth, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ativo', 'pendente', 'inativo'].includes(status)) {
        console.log('Backend: Status inválido fornecido para atualização:', status);
        return res.status(400).json({ message: 'Status inválido fornecido.' });
    }

    try {
        console.log(`Backend: Tentando atualizar status do currículo ${id} para ${status}.`);
        const curriculum = await Curriculum.findById(id);

        if (!curriculum) {
            console.log('Backend: Currículo não encontrado para atualização de status.');
            return res.status(404).json({ message: 'Currículo não encontrado.' });
        }

        curriculum.status = status;
        await curriculum.save();
        console.log(`Backend: Status do currículo ${id} atualizado com sucesso para ${status}.`);

        res.status(200).json({ message: `Status do currículo atualizado para '${status}' com sucesso!`, curriculum });

    } catch (error) {
        console.error('Backend: Erro ao atualizar status do currículo:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de currículo inválido.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar status do currículo.' });
    }
});


// --- NOVA ROTA PARA UPLOAD DE FOTO DE PERFIL ---
app.post('/api/alunos/upload-foto', auth, upload.single('fotoPerfil'), async (req, res) => {
    try {
        console.log('Backend: Requisição /api/alunos/upload-foto recebida!');
        if (!req.file) {
            console.log('Backend: Nenhum arquivo de foto enviado no upload.');
            return res.status(400).json({ message: 'Nenhum arquivo de foto enviado.' });
        }

        const alunoEmail = req.user.email;
        const fotoPath = `/uploads/fotos/${req.file.filename}`;
        console.log(`Backend: Foto recebida para ${alunoEmail}. Caminho: ${fotoPath}`);

        const curriculum = await Curriculum.findOneAndUpdate(
            { alunoEmail: alunoEmail },
            { fotoUrl: fotoPath },
            { new: true, upsert: true, runValidators: true }
        );

        if (!curriculum) {
            console.log('Backend: Currículo do aluno não encontrado para atualizar foto.');
            return res.status(404).json({ message: 'Currículo do aluno não encontrado para atualizar a foto.' });
        }
        console.log('Backend: FotoUrl do currículo atualizada no BD.');

        res.status(200).json({
            message: 'Foto de perfil atualizada com sucesso!',
            fotoUrl: fotoPath,
            curriculum: curriculum
        });

    } catch (error) {
        console.error('Backend: Erro no upload da foto ou ao atualizar currículo:', error);
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || 'Erro interno do servidor ao fazer upload da foto.' });
    }
});

// Rota para buscar o currículo do aluno logado
app.get('/api/alunos/meu-curriculo', auth, async (req, res) => {
    try {
        const alunoEmail = req.user.email;
        const curriculum = await Curriculum.findOne({ alunoEmail });
        if (!curriculum) {
            return res.status(404).json({ message: 'Currículo não encontrado.' });
        }
        res.status(200).json(curriculum);
    } catch (error) {
        console.error('Erro ao buscar currículo do aluno:', error);
        res.status(500).json({ message: 'Erro ao buscar currículo.' });
    }
});

// --- Iniciando o Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});