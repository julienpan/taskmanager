const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dataRouter = require('./routes/data');

const PORT = process.env.PORT || 8080;
const app = express();

// Middleware
app.use(cors()); // Gestion des CORS
app.use(bodyParser.json()); // Analyse le corps des requêtes au format JSON

// Routes
app.use('/data', dataRouter); // Utilisation du routeur pour les endpoints API

// Gestion des erreurs 404 (route non trouvée)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
