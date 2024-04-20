const express = require('express');
const dataRouter = express.Router();
const db = require('../db');

// Endpoint pour la page d'accueil
dataRouter.get('/', (req, res) => {
    res.send('Bienvenue sur la page d\'accueil !');
});

dataRouter.get('/get', async (req, res) => {
    const page = req.query.page || 1; // Numéro de la page, par défaut 1
    const pageSize = req.query.pageSize || 10; // Taille de la page, par défaut 10

    const offset = (page - 1) * pageSize; // Calculer l'offset pour la requête SQL

    try {
        const result = await db.query('SELECT * FROM tasks ORDER BY priority ASC LIMIT $1 OFFSET $2', [pageSize, offset]);
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
dataRouter.post('/create', async (req, res) => {
    try {
        // Récupérer les données envoyées depuis le front-end
        const { title, dueDate, status, priority } = req.body;

        // Vérifier si les champs requis sont vides
        if (!title || !dueDate || !status || !priority) {
            return res.status(400).json({ error: 'Veuillez fournir tous les champs requis.' }); // Code 400 pour indiquer une mauvaise requête
        }

        const creationDate = new Date();
        // Insérer les données dans la base de données
        const result = await db.query('INSERT INTO tasks (title, creation_date, due_date, status, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *', [title, creationDate, dueDate, status, priority]);
        // Renvoyer les données insérées en tant que réponse
        res.status(201).json(result.rows[0]); // Code 201 pour indiquer que la ressource a été créée avec succès
    } catch (error) {
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

module.exports = dataRouter;
