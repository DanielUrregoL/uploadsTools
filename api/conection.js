// Importaciones necesarias
const sql = require('mssql');
const mysql = require('mysql2/promise');
const express = require("express");
const connection = express.Router();

let config = {};
let type = 0;
let table = ''
// Ruta para conectar a la base de datos
connection.post('/', async (req, res) => {
    type = req.body.type; // 1 para MySQL, 2 para SQL Server
    table = req.body.table;
    if (type === "1") {
        config = {
            host: req.body.server,
            port: Number(req.body.port),
            user: req.body.user,
            password: req.body.password,
            database: req.body.database
        };
    } else if (type === "2") {
        config = {
            server: req.body.server,
            port: Number(req.body.port),
            user: req.body.user,
            password: req.body.password,
            database: req.body.database,
            options: {
                encrypt: true, // Específico para SQL Server
                trustServerCertificate: true, // Específico para SQL Server
            },
            requestTimeout: 500000 // Tiempo de espera en milisegundos
        };
    }

    try {
        await connectToDatabase(config);
        res.send('Conexión establecida con éxito');
    } catch (error) {
        console.error('Error al conectar con la base de datos', error);
        res.status(500).send('Error al conectar con la base de datos');
    }
});

// Función para conectar a la base de datos
async function connectToDatabase(config) {
    if (type === "1") { // MySQL
        try {
            const connection = await mysql.createConnection(config);
            console.log('Conexión establecida con MySQL');
            await connection.end();
        } catch (error) {
            console.error('Error al conectar con MySQL', error);
            throw error;
        }
    } else if (type === "2") { // SQL Server
        try {
            await sql.connect(config);
            console.log('Conexión establecida con SQL Server');
        } catch (error) {
            console.error('Error al conectar con SQL Server', error);
            throw error;
        }
    } else {
        throw new Error('Tipo de base de datos no soportado');
    }
};

function getConfig() {

    return {config, table};
}

module.exports = { connection, getConfig };