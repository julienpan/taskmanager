const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 8080;

const pool = new Pool({
    user: "julienpan",
    host: "localhost",
    database: "taskmanager",
    password: "123456",
    port: 5432
});

const jsonData = fs.readFileSync('./data.json', 'utf8');
const data = JSON.parse(jsonData);

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        creation_date TIMESTAMP,
        due_date TIMESTAMP,
        status VARCHAR(20),
        validation_date TIMESTAMP
    )
`;

pool.query(createTableQuery)
    .then(() => {        
        // Insérer des données uniquement si la table est nouvellement créée
        pool.query('SELECT COUNT(*) FROM tasks', (err, result) => {
            if (err) {
                console.error('Erreur lors de la récupération du nombre de lignes:', err);
            } else {
                const rowCount = parseInt(result.rows[0].count);
                if (rowCount === 0) {
                    // Insertion des données dans la table
                    data.forEach(item => {
                        const validationDate = item.validationDate ? item.validationDate : null;
                        const insertQuery = {
                            text: 'INSERT INTO tasks(title, creation_date, due_date, status, validation_date) VALUES($1, $2, $3, $4, $5)',
                            values: [item.title, item.creationDate, item.dueDate, item.status, validationDate]
                        };
                        pool.query(insertQuery)
                            .then(() => console.log('Données insérées avec succès'))
                            .catch(err => console.error('Erreur lors de l\'insertion des données:', err));
                    });
                }
            }
        });
    })
    .catch(err => console.error('Erreur lors de la création de la table:', err));

app.get('/', (req, res) => {
    res.send('Bienvenue sur la page d\'accueil !');
});

app.get('/getData', (req, res) => {
    pool.query('SELECT * FROM tasks', (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération des données:', err);
            res.status(500).send('Erreur lors de la récupération des données');
        } else {
            res.json(result.rows);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
