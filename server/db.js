const config = require('./config');
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool(config.db);
const jsonData = fs.readFileSync('./data.json', 'utf8');
const data = JSON.parse(jsonData);


async function createUserTable() {

    const createTableUsers = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255),
        password VARCHAR(255),
        creation_date TIMESTAMP
    )
`;

    await pool.query(createTableUsers).then(() => {
        console.log('Création de la table users réussie si non existante');
    }).catch(error => {
        console.error('Erreur lors de la création de la table users', error);
    });
}


async function createTasksTable() {
    const createTableTasks = `
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        creation_date TIMESTAMP,
        due_date TIMESTAMP,
        status VARCHAR(20),
        validation_date TIMESTAMP,
        priority INTEGER,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`;

    await pool.query(createTableTasks).then(() => {
        console.log('Creation de la table tasks réussie si non existante');
    }).catch(error => {
        console.error('Erreur lors de la création de la table tasks', error);
    });
}

async function main() {
    await createUserTable();
    await createTasksTable();
}

main();


module.exports = {
    query: (text, params) => pool.query(text, params),
};