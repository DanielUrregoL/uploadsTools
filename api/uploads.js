const express = require("express");
const uploads = express.Router();
const sql = require('mssql');
const loadCsvFile = require('./functionCSV.js');
const loadXslxFile = require('./functionXSLX.js');
const loadSqlFile = require('./functionSQL.js');
const multer = require('multer');
const { getConfig } = require("./conection.js");
const upload = multer({ dest: 'uploads/' });
const functionSQL2 = require('./functionSQL2.js');

// Definimos la estructura de la tabla
const tableStructure = [
    { name: 'NaturalezaTipoPersona', type: sql.VarChar(50), nullable: false, primary: false },
    { name: 'IdEntidad', type: sql.Int, nullable: true, primary: false },
    { name: 'TipoDocumento', type: sql.VarChar(5), nullable: false, primary: false },
    { name: 'NumeroIdentificacion', type: sql.Int, nullable: false, primary: false },
    { name: 'DV', type: sql.Char(1), nullable: true, primary: false },
    { name: 'PrimerApellido', type: sql.VarChar(50), nullable: true, primary: false },
    { name: 'SegundoApellido', type: sql.VarChar(50), nullable: true, primary: false },
    { name: 'PrimerNombre', type: sql.VarChar(50), nullable: true, primary: false },
    { name: 'OtrosNombres', type: sql.VarChar(50), nullable: true, primary: false },
    { name: 'RazonSocial', type: sql.VarChar(100), nullable: true, primary: false },
    { name: 'ApellidosNombresRazonSocial', type: sql.VarChar(100), nullable: true, primary: false },
    { name: 'Direccion', type: sql.VarChar(100), nullable: true, primary: false },
    { name: 'CodigoDpto', type: sql.VarChar(10), nullable: true, primary: false },
    { name: 'CodigoMcp', type: sql.VarChar(10), nullable: true, primary: false },
    { name: 'Municipio', type: sql.VarChar(50), nullable: true, primary: false },
    { name: 'CodigoPais', type: sql.VarChar(10), nullable: true, primary: false },
    { name: 'CorreoElectronico', type: sql.VarChar(100), nullable: true, primary: false },
    { name: 'TelefonoFijo', type: sql.VarChar(20), nullable: true, primary: false },
    { name: 'TelefonoCelular', type: sql.VarChar(20), nullable: true, primary: false },
    { name: 'ActividadEconomica', type: sql.VarChar(50), nullable: true, primary: false },
];

// Consulta de la tabla
uploads.get('/', (req, res) => {
    const pool = new sql.ConnectionPool(config);
    pool.connect().then(() => {
        const request = new sql.Request(pool
        );
        request.query('SELECT TOP 10 * FROM PersonasDaul').then(result => {
            res.status(200).send(result.recordset);
            pool.close();
        }).catch(err => {
            res.status(500).send(err.message);
            pool.close();
        });
    }
    ).catch(err => {
        res.status(500).send(err.message);
    });
});
// Envio de archivos
uploads.post('/', upload.single('file'), (req, res) => { // Usa multer para manejar la subida de un archivo con el nombre 'file'
    const file = req.file;
    const config = getConfig();
    //console.log('configuracion', config);
    // Si no se subió ningún archivo
    if (!file) {
        res.status(400).send('No file uploaded');
        return;
    }
    if (!config) {
        res.status(400).send('No connection to database');
        return;
    }
    // Si el archivo es de tipo CSV
    if (file.mimetype === 'text/csv') {
        loadCsvFile(file, tableStructure, config)
            .then(result => {
                res.status(200).send(result);
            })
            .catch(err => {
                res.status(500).send(`Error processing CSV file: ${err.message}`);
            });
    }
    // Si el archivo es de tipo XLSX
    else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        loadXslxFile(file, tableStructure, config)
            .then(result => {
                res.status(200).send('XLSX file processed successfully');
            })
            .catch(err => {
                res.status(500).send(`Error processing XLSX file: ${err.message}`);
            });
    }
    // Si el archivo es de tipo SQL
    else if (file.mimetype === 'text/plain' || file.mimetype === 'application/sql' || file.mimetype === 'application/x-sql' || file.mimetype === 'application/x-sqlite3' || file.mimetype === 'application/x-sqlite') {
        loadSqlFile(file, config)
            .then(result => {
                res.status(200).send('SQL file processed successfully');
            })
            .catch(err => {
                res.status(500).send(`Error processing SQL file: ${err.message}`);
            });
    }
    // Si el archivo no es de un tipo válido
    else {
        console.log(file.mimetype);
        res.status(400).send('Invalid file type' + file.mimetype);
    }
});

uploads.post('/sql', (req, res) => {
    const configDestino = req.body;
    //console.log(configDestino);
    functionSQL2(tableStructure, configDestino, config)
        .then(result => {
            res.status(200).send('Data process successfully');
        })
        .catch(err => {
            res.status(500).send(`Error processing SQL data: ${err.message}`);
        });
});

module.exports = uploads;