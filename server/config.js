require('dotenv').config(); // Charge les variables d'environnement à partir d'un fichier .env

module.exports = {
    db: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    },
    port: 8080,
    
};