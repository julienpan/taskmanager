const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = express.Router();
const db = require('../db');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_KEY);


// Endpoint pour vérifier le token
loginRouter.post('/verify-token', (req, res) => {
    // Récupérer le token depuis les en-têtes de la requête
    const token = req.headers.authorization;
    if (!token) {
        return res.status(400).json({ error: 'Token manquant dans les en-têtes de la requête' });
    }

    // Extraire le token du format "Bearer <token>"
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(400).json({ error: 'Format de token invalide' });
    }
    const authToken = tokenParts[1];

    // Vérifier le token
    jwt.verify(authToken, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            // Le token est invalide ou expiré
            res.status(401).json({ error: 'Token invalide ou expiré' });
        } else {
            // Le token est valide, envoyer les données du token décrypté au client
            res.status(200).json({ decoded });
        }
    });
});


// Route pour l'inscription
loginRouter.post('/register', async (req, res) => {
    // Vérifiez les informations d'identification de l'utilisateur
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Veuillez fournir tous les champs requis.' });
    }
    try {
        // Vérifiez si le nom d'utilisateur est déjà pris
        const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà pris.' });
        }

        await db.query('BEGIN');
        // Hash du mot de passe
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        // Insérer un nouvel utilisateur dans la base de données
        const userQuery = await db.query(`INSERT INTO users (username, password) VALUES ($1, $2)`, [username, hash]);

        // Générer le token JWT pour l'utilisateur nouvellement inscrit
        const user = { username: username };
        const accessToken = jwt.sign(user, process.env.TOKEN_SECRET);

        const customer = await stripe.customers.search({
            query: `name: \'${username}\'`,
        });

        if (customer.data.length == 0) {
            customer = await stripe.customers.create({
                name: user.username,
            });
            console.log(`Création d'un profil stripe`);
        }
        await db.query('COMMIT');
        res.json({ accessToken });

    } catch (error) {
        await db.query('ROLLBACK');

        console.error(`Erreur lors de l'inscription de l'utilisateur`, error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription de l\'utilisateur' });
    }
});

loginRouter.post('/sign', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Veuillez fournir tous les champs requis.' });
    }
    try {
        const currentUser = await db.query('SELECT password FROM users WHERE username = $1', [username]);

        if (currentUser.rows.length > 0) {

            const hash = currentUser.rows[0].password;

            const validate = await bcrypt.compare(password, hash);

            const user = { username: username };
            const accessToken = jwt.sign(user, process.env.TOKEN_SECRET);

            if (validate) {
                res.json({ accessToken });
            } else {
                return res.status(400).json({ error: 'Username ou mot de passe invalide' });
            }
        } else {
            return res.status(400).json({ error: 'Username ou mot de passe invalide' });
        }
    } catch (error) {
        console.error(`Erreur lors de la connexion de l'utilisateur`, error);
        res.status(500).json({ error: 'Erreur lors de la connexion de l\'utilisateur' });
    }
});

module.exports = loginRouter;
