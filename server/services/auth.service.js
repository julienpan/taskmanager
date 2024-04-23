const express = require('express');
const jwt = require('jsonwebtoken');


// Middleware d'authentification
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }

    // Extraire le token du format "Bearer <token>"
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(400).json({ error: 'Format de token invalide' });
    }
    const authToken = tokenParts[1];

    // Vérifier le token JWT
    jwt.verify(authToken, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }

        // Stocker les informations de l'utilisateur dans l'objet de requête
        req.user = decoded;
        next();
    });
};

module.exports = {authenticateUser};