const fs = require('fs');
const csv = require('csv-parser');
const primaryFuntion = require('./primaryFuntion.js');

// Función para cargar un archivo CSV a una tabla de la base de datos
function loadCsvFile(file, tableStructure, config) {
    return new Promise((resolve, reject) => {
        const rows = [];
        const stream = fs.createReadStream(file.path).pipe(csv({ separator: ';' }));
        // convertir el archivo CSV a un array de filas 
        stream.on('readable', () => {
            let row;
            while (null !== (row = stream.read())) {
                rows.push(Object.values(row));
            }
        });
        // cuando se termina de leer el archivo, llamar a la función principal
        stream.on('end', () => {
            // console.log(rows);
            primaryFuntion(tableStructure, config, rows, resolve, reject);
            resolve(primaryFuntion(tableStructure, config, rows, resolve, reject));
        });
        // en caso de error, rechazar la promesa
        stream.on('error', reject);
    });
};

module.exports = loadCsvFile;