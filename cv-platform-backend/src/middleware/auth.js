const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // 1. Obter o token do cabeçalho
    // Espera-se que o token venha como: Authorization: Bearer <TOKEN>
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Nenhum token, autorização negada.' });
    }

    const token = authHeader.split(' ')[1]; // Pega a parte do token após "Bearer "

    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido, autorização negada.' });
    }

    // 2. Verificar o token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Adiciona o payload decodificado (contendo o email do aluno) ao objeto de requisição
        req.user = decoded; // Agora você pode acessar req.user.email em suas rotas
        next(); // Passa para o próximo middleware ou rota
    } catch (err) {
        res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = auth;