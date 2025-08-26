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
const os = require('os'); // <-- Adicionar esta linha para acessar informações do sistema
const Job = require('./src/models/Job');

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

// --- Configuração do Multer para Upload de PDFs ---
const storagePDF = multer.diskStorage({
    destination: function (req, file, cb) {
        const pdfsDir = path.join(__dirname, 'uploads', 'pdfs');
        if (!fs.existsSync(pdfsDir)) {
            fs.mkdirSync(pdfsDir, { recursive: true });
        }
        cb(null, pdfsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.email + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadPDF = multer({
    storage: storagePDF,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos PDF são permitidos!'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

// --- Rota de upload do PDF do currículo do aluno ---
app.post('/api/alunos/upload-pdf', auth, uploadPDF.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado.' });
        }
        const alunoEmail = req.user.email;
        const pdfPath = `/uploads/pdfs/${req.file.filename}`;

        // Busca o currículo do aluno
        const curriculo = await Curriculum.findOne({ alunoEmail });
        if (curriculo && curriculo.pdfUrl) {
            // Remove o PDF antigo do servidor
            const fs = require('fs');
            const path = require('path');
            const oldFilePath = path.join(__dirname, curriculo.pdfUrl);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Atualiza o currículo com o novo PDF
        await Curriculum.findOneAndUpdate(
            { alunoEmail },
            { pdfUrl: pdfPath },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json({ success: true, pdfUrl: pdfPath });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
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

    // Busca o curso do aluno no currículo, se existir
    let curso = null;
    try {
        const curriculum = await Curriculum.findOne({ alunoEmail: email });
        curso = curriculum ? curriculum.curso : null;
    } catch (err) {
        console.error('Backend: Erro ao buscar currículo para obter curso:', err);
    }

    // Inclui o curso no token JWT
    const token = jwt.sign({ email: email, role: 'aluno', curso }, JWT_SECRET, { expiresIn: '1h' });

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

// Rota para Listar Currículos SELECIONADOS (Empresa)
app.get('/api/curriculos/ativos', async (req, res) => {
    try {
        console.log('Backend: Requisição /api/curriculos/ativos (selecionados) recebida!');
        
        // ALTERAÇÃO PRINCIPAL AQUI
        // Agora, buscamos currículos que o admin marcou como selecionados.
        const selectedCurriculums = await Curriculum.find({ 
            selecionadoParaEmpresa: true 
        }).select('-__v -createdAt -updatedAt');

        if (selectedCurriculums.length === 0) { // Variável atualizada
            console.log('Backend: Nenhum currículo selecionado foi encontrado.');
            return res.status(404).json({ message: 'Nenhum currículo selecionado foi encontrado no momento.' });
        }

        console.log(`Backend: ${selectedCurriculums.length} currículos selecionados encontrados.`); // Variável atualizada
        res.status(200).json(selectedCurriculums); // Variável atualizada

    } catch (error) {
        console.error('Backend: Erro ao buscar currículos selecionados:', error);
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
    const { email, senha } = req.body;

    if (email === ADMIN_EMAIL && senha === ADMIN_PASSWORD) {
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

app.put('/api/admin/curriculos/:id/select', auth, authorizeAdmin, async (req, res) => {
    try {
        const curriculoId = req.params.id;
        const curriculo = await Curriculum.findById(curriculoId);
        if (!curriculo) {
            return res.status(404).json({ success: false, message: 'Currículo não encontrado.' });
        }
        curriculo.selecionadoParaEmpresa = !curriculo.selecionadoParaEmpresa;
        await curriculo.save();
        res.json({ success: true, selecionadoParaEmpresa: curriculo.selecionadoParaEmpresa });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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
app.get('/api/alunos/curriculo', auth, async (req, res) => {
    try {
        const alunoEmail = req.user.email;
        const curriculo = await Curriculum.findOne({ alunoEmail });
        if (!curriculo) {
            return res.json({ success: true, curriculo: null });
        }
        res.json({ success: true, curriculo });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- NOVA ROTA PARA REMOVER O PDF DO CURRÍCULO ---
app.delete('/api/alunos/pdf', auth, async (req, res) => {
    try {
        const alunoEmail = req.user.email;
        // Busca o currículo do aluno
        const curriculo = await Curriculum.findOne({ alunoEmail });
        if (!curriculo || !curriculo.pdfUrl) {
            return res.status(404).json({ success: false, message: 'Nenhum PDF cadastrado.' });
        }

        // Opcional: Remover o arquivo físico do servidor
        const pdfPath = curriculo.pdfUrl;
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, pdfPath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove o campo pdfUrl do currículo
        curriculo.pdfUrl = '';
        await curriculo.save();

        res.json({ success: true, message: 'PDF removido com sucesso.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- Cadastro de vaga (apenas admin) ---
app.post('/api/admin/vagas', auth, authorizeAdmin, async (req, res) => {
    try {
        const vaga = new Job(req.body);
        await vaga.save();
        res.json({ success: true, vaga });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// --- Listar vagas (aluno vê só do seu curso) ---
app.get('/api/vagas', auth, async (req, res) => {
    try {
        const curso = req.user.curso; // agora vem do token JWT do aluno
        const vagas = await Job.find({ curso, status: 'ativo' });
        res.json({ success: true, vagas });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- Candidatar-se a uma vaga (aluno) ---
app.post('/api/vagas/:id/candidatar', auth, async (req, res) => {
    try {
        const vaga = await Job.findById(req.params.id);
        if (!vaga) return res.status(404).json({ success: false, message: 'Vaga não encontrada.' });

        // Adiciona o currículo do aluno ao array de candidatos, se ainda não estiver
        const curriculo = await Curriculum.findOne({ alunoEmail: req.user.email });
        if (!curriculo) return res.status(404).json({ success: false, message: 'Currículo não encontrado.' });

        if (!vaga.candidatos.includes(curriculo._id)) {
            vaga.candidatos.push(curriculo._id);
            await vaga.save();
        }

        // Aqui você pode disparar o e-mail de confirmação se quiser

        res.json({ success: true, message: 'Candidatura registrada.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- Dashboard de vagas para admin (listar todas) ---
app.get('/api/admin/vagas', auth, authorizeAdmin, async (req, res) => {
    try {
        const vagas = await Job.find().populate('candidatos');
        res.json({ success: true, vagas });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- Ativar/Inativar vaga ---
app.put('/api/admin/vagas/:id/status', auth, authorizeAdmin, async (req, res) => {
    try {
        const vaga = await Job.findById(req.params.id);
        if (!vaga) return res.status(404).json({ success: false, message: 'Vaga não encontrada.' });
        vaga.status = req.body.status;
        await vaga.save();
        res.json({ success: true, vaga });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});



// --- Selecionar currículo para vaga (admin aprova candidatura) ---
app.put('/api/admin/vagas/:vagaId/selecionar/:curriculoId', auth, authorizeAdmin, async (req, res) => {
    try {
        const vaga = await Job.findById(req.params.vagaId);
        if (!vaga) return res.status(404).json({ success: false, message: 'Vaga não encontrada.' });

        // Aqui você pode criar um array separado para "selecionados" se quiser, ou marcar no próprio currículo
        // Exemplo: adicionar um campo selecionados: []
        if (!vaga.selecionados) vaga.selecionados = [];
        if (!vaga.selecionados.includes(req.params.curriculoId)) {
            vaga.selecionados.push(req.params.curriculoId);
            await vaga.save();
        }

        // Aqui você pode disparar o e-mail de aprovação

        res.json({ success: true, message: 'Currículo selecionado para vaga.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/vagas/:id', auth, async (req, res) => {
    try {
        const vaga = await Job.findById(req.params.id);
        if (!vaga) {
            return res.status(404).json({ success: false, message: 'Vaga não encontrada.' });
        }
        res.json({ success: true, vaga });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/admin/vagas/:id', auth, async (req, res) => {
    try {
        const vaga = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!vaga) {
            return res.status(404).json({ success: false, message: 'Vaga não encontrada.' });
        }
        res.json({ success: true, vaga });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- Iniciando o Servidor ---

// Função para encontrar o IP local na rede
const getLocalIpAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
            // Pula endereços que não são IPv4 e endereços internos (ex: 127.0.0.1)
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '0.0.0.0'; // Retorna um padrão caso não encontre
};

const localIp = getLocalIpAddress();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://${localIp}:${PORT}`);
});