const config = require('./config');
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool(config.db);
const jsonData = fs.readFileSync('./data.json', 'utf8');
const data = JSON.parse(jsonData);

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        creation_date TIMESTAMP,
        due_date TIMESTAMP,
        status VARCHAR(20),
        validation_date TIMESTAMP,
        priority INTEGER
    )
`;

pool.query(createTableQuery).then(() => {
    console.log('Creation de la table tasks réussie si non existante');
}).catch(error => {
    console.log('Erreur lors de la création de la table tasks');
})
    // .then(() => {
    //     // Insérer des données uniquement si la table est nouvellement créée
    //     pool.query('SELECT COUNT(*) FROM tasks', (err, result) => {
    //         if (err) {
    //             console.error('Erreur lors de la récupération du nombre de lignes:', err);
    //         } else {
    //             const rowCount = parseInt(result.rows[0].count);
    //             if (rowCount === 0) {
    //                 // Insertion des données dans la table
    //                 data.forEach(item => {
    //                     const validationDate = item.validationDate ? item.validationDate : null;
    //                     const insertQuery = {
    //                         text: 'INSERT INTO tasks(title, creation_date, due_date, status, validation_date, priority) VALUES($1, $2, $3, $4, $5, $6)',
    //                         values: [item.title, item.creationDate, item.dueDate, item.status, validationDate, item.priority]
    //                     };
    //                     pool.query(insertQuery)
    //                         .then(() => console.log('Données insérées avec succès'))
    //                         .catch(err => console.error('Erreur lors de l\'insertion des données:', err));
    //                 });
    //             }
    //         }
    //     });
    // })
    // .catch(err => console.error('Erreur lors de la création de la table:', err));
    
module.exports = {
    query: (text, params) => pool.query(text, params),
};