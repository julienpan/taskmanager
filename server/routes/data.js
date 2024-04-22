const express = require('express');
const dataRouter = express.Router();
const db = require('../db');
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

// Appliquer le middleware d'authentification à toutes les routes sauf la page d'accueil
dataRouter.use(authenticateUser);

// Endpoint pour la page d'accueil
dataRouter.get('/', (req, res) => {
    res.send('Bienvenue sur la page d\'accueil !');
});

dataRouter.get('/get', authenticateUser, async (req, res) => {
    const page = req.query.page || 1; // Numéro de la page, par défaut 1
    const pageSize = req.query.pageSize || 10; // Taille de la page, par défaut 10

    const offset = (page - 1) * pageSize; // Calculer l'offset pour la requête SQL

    try {
        const result = await db.query('SELECT * FROM tasks ORDER BY priority ASC, status ASC LIMIT $1 OFFSET $2', [pageSize, offset]);
        const maxResult = await db.query('SELECT COUNT(*) FROM tasks');
        const size = maxResult.rows[0].count;
        res.json({
            data: result.rows,
            totalDataCount: size
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).send('Erreur lors de la récupération des données');
    }
});


// Endpoint pour créer une nouvelle tâche
dataRouter.post('/create', authenticateUser, async (req, res) => {
    try {
        // Récupérer les données envoyées depuis le front-end
        const { title, dueDate, status, priority } = req.body;

        const username = req.user.username;

        // Vérifier si les champs requis sont vides
        if (!title || !dueDate || !status || !priority) {
            return res.status(400).json({ error: 'Veuillez fournir tous les champs requis.' }); // Code 400 pour indiquer une mauvaise requête
        }

        // Récupérer l'ID de l'utilisateur à partir du nom d'utilisateur
        const userResult = await db.query('SELECT id FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }
        const userId = userResult.rows[0].id;

        const creationDate = new Date();

        await db.query('BEGIN');
        // Insérer les données dans la base de données
        const result = await db.query('INSERT INTO tasks (title, creation_date, due_date, status, priority, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [title, creationDate, dueDate, status, priority, userId]);
        // Renvoyer les données insérées en tant que réponse

        await db.query('COMMIT');

        res.status(201).json(result.rows[0]); // Code 201 pour indiquer que la ressource a été créée avec succès
    } catch (error) {

        await db.query('ROLLBACK');

        console.error('Erreur lors de la création de la tâche:', error);
        res.status(500).send('Erreur lors de la création de la tâche');
    }
});


dataRouter.put('/modify/:id', async (req, res) => {
    const id = parseInt(req.params.id); // Récupérer l'ID de la tâche à partir de l'URL
    const { title, dueDate, status, priority } = req.body; // Récupérer les nouvelles données de la tâche à partir du corps de la requête
    try {
        let query;
        let values;

        // Vérifier si le statut est 'VALIDATED'
        if (status === 'VALIDATED') {
            query = 'UPDATE tasks SET title = $1, due_date = $2, status = $3, priority = $4, validation_date = NOW() WHERE id = $5 RETURNING *';
            values = [title, dueDate, status, priority, id];
        } else {
            query = 'UPDATE tasks SET title = $1, due_date = $2, status = $3, priority = $4, validation_date = NULL WHERE id = $5 RETURNING *';
            values = [title, dueDate, status, priority, id];
        }

        const result = await db.query({
            text: query,
            values: values
        });

        // Vérifier si une tâche a été mise à jour
        if (result.rowCount === 1) {
            res.status(200).json(result.rows[0]); // Envoyer la tâche mise à jour en réponse
        } else {
            res.status(404).json({ error: 'Tâche non trouvée' }); // Envoyer une réponse 404 si la tâche n'a pas été trouvée
        }
    } catch (error) {
        console.error('Erreur lors de la modification de la tâche:', error);
        res.status(500).json({ error: 'Erreur lors de la modification de la tâche' }); // Envoyer une réponse 500 en cas d'erreur serveur
    }
});

dataRouter.delete('/delete/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const result = await db.query("DELETE FROM tasks WHERE id = $1", [id]);
        // Vérifier si une tâche a été supprimée
        if (result.rowCount === 1) {
            res.status(200).json({ message: 'Tâche supprimée avec succès' }); // Envoyer une réponse 200 si la suppression réussit
        } else {
            res.status(404).json({ error: 'Tâche non trouvée' }); // Envoyer une réponse 404 si la tâche n'est pas trouvée
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' }); // Envoyer une réponse 500 en cas d'erreur serveur
    }
});

dataRouter.post('/search/:value', async (req, res) => {
    const value = req.params.value;
    try {
        const result = await db.query("SELECT * FROM tasks WHERE LOWER(title) LIKE $1", [`%${value}%`]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erreur lors de la recherche des tâches", error);
        res.status(500).json({ error: "Erreur lors de la recherche des tâches" });
    }
});

dataRouter.post('/search', async (req, res) => {
    const searchForm = req.body.searchForm;

    console.log(searchForm);
    try {
        let query = "SELECT * FROM tasks WHERE 1=1"; // Commencez par une condition toujours vraie

        const params = []; // Tableau pour stocker les paramètres pour la requête préparée

        // Ajoutez la condition pour title si elle est fournie
        if (searchForm.title) {
            console.log('title')
            query += " AND LOWER(title) LIKE $1";
            params.push(`%${searchForm.title}%`);
        }
        
        // Ajoutez la condition pour user_id si elle est fournie
        if (searchForm.user_id && searchForm.user_id != 0) {
            console.log('user_id')
            // Si title est fourni, utilisez $2 pour user_id, sinon utilisez $1
            const user_id_param_index = searchForm.title ? 2 : 1;
            query += ` AND user_id = $${user_id_param_index}`;
            params.push(searchForm.user_id);
        }
        
        // Supprimez la condition WHERE si ni title ni user_id ne sont fournis
        if (!searchForm.title && !searchForm.user_id) {
            query = "SELECT * FROM tasks";
        }

        console.log(`${query} ${params}`);

        const result = await db.query(query, params);

        res.json(result.rows);
    } catch (error) {
        console.error("Erreur lors de la recherche des tâches", error);
        res.status(500).json({ error: "Erreur lors de la recherche des tâches" });
    }
});

module.exports = dataRouter;
