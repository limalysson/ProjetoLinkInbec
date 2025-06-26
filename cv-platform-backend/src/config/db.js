const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Obtenha a URI do MongoDB das variáveis de ambiente
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            console.error('ERRO: Variável de ambiente MONGO_URI não definida.');
            process.exit(1); // Encerra o processo se a URI não estiver configurada
        }

        await mongoose.connect(mongoURI);
        console.log('MongoDB Conectado com Sucesso!');
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err.message);
        // Sair do processo com falha
        process.exit(1);
    }
};

module.exports = connectDB;