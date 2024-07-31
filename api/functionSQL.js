const sql = require('mssql');
const fs = require('fs');
/*
// Función para cargar un archivo SQL a la base de datos
function loadSqlFile(file, config) {
    return new Promise((resolve, reject) => {
        // Leer el archivo SQL
        const chunks = [];
        const chunkSize = 960;
        for (let i = 0; i < 2; i ++) {
            const chunk = chunks.slice(i, i + chunkSize);
            
        fs.createReadStream(file.path, { encoding: 'utf8' })
            .on('data', chunk => {
                chunks.push(chunk);
            })
            .on('end', () => {

                const data = chunks.join('');
                // Conectar a la base de datos
                const pool = new sql.ConnectionPool(config);
                pool.connect().then(() => {
                    // Ejecutar la consulta
                    new sql.Request(pool).query(data).then(result => {
                        resolve(result);
                        pool.close();
                    }).catch(err => {
                        reject(err);
                        pool.close();
                    });
                }).catch(reject);
            });
        }
    })

    */
// Función para cargar un archivo SQL a la base de datos
function loadSqlFile(file, config) {
    return new Promise((resolve, reject) => {

        // Leer el archivo SQL
        fs.readFile(file.path, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            // Conectar a la base de datos 
            const pool = new sql.ConnectionPool(config);
            pool.connect().then(() => {
                // Ejecutar la consulta
                new sql.Request(pool).query(data).then(result => {
                    resolve(result);
                    pool.close();
                    console.log("loadSqlFile.js cargado");
                }).catch(err => {
                    reject(err);
                    pool.close();
                });
            }).catch(reject);
        });
    });
};

module.exports = loadSqlFile;