const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Función para cargar un archivo CSV a una tabla de la base de datos
async function createrFromCsv(file, numbersOfRecords) {
    let url = '';
    let cabecera = '';
    try {
        const rows = []; // Array para guardar las filas del archivo CSV original
        const readStream = fs.createReadStream(file.path).pipe(csv({ separator: ',' }));
        console.log('Reading CSV file...');

        // convertir el archivo CSV a un array de filas 
        readStream.on('data', (row) => {
            if (rows.length === 0) {
                cabecera = Object.keys(row).join(',') + '\n'; // Capturar la cabecera
                console.log('Cabecera:', cabecera);
            }
            rows.push(Object.values(row));
        });

        // Manejar errores de lectura
        readStream.on('error', (err) => {
            console.error('Error reading file', err);
            throw err;
        });

        // Esperar a que se termine de leer el archivo
        await new Promise((resolve, reject) => {
            readStream.on('end', () => {
                console.log(rows.length)
                console.log('File read successfully');
                resolve();
            });
            readStream.on('Error', reject);
        });

        // Insertar las filas requeridas desde el arhicvo origen en un nuevo array 
        let newData = [];

        console.log('Cabecera:', cabecera);
        numbersOfRecords = (numbersOfRecords / rows.length);
        for (let i = 0; i < numbersOfRecords; i++) {
            newData.push(...rows);
        };

        // Crear un directorio para guardar el archivo csv si no existe
        const folder = path.join(__dirname, 'CsvFiles');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        // Crear un archivo CSV con las filas requeridas
        console.log(newData.length);
        console.log('Writing CSV file...');
        let CsvFilePath = path.join(folder, 'CSV.csv');
        let counter = 0;
        while (fs.existsSync(CsvFilePath)) {
            counter++;
            CsvFilePath = path.join(folder, 'CSV' + counter + '.csv');
        }

        const writeStream = fs.createWriteStream(CsvFilePath);
        const fileName = CsvFilePath.split(path.sep).pop();
        url = `http://localhost:9000/downloads/creater/${fileName}`;
        writeStream.write(cabecera);


        // Función para escribir el archivo en chunks
        let i = 0;
        const chunkSize = 10000;
        function writeInBlocks() {
            let ok = true;
            while (i < newData.length && ok) {
                const chunk = newData.slice(i, i + chunkSize).map(row => row.join(',')).join('\n') + '\n';
                ok = writeStream.write(chunk);
                i += chunkSize;
            }
            if (i < newData.length) {
                writeStream.once('drain', writeInBlocks);
            } else { writeStream.end(); }
        };
        writeInBlocks();

        // resolve la promesa si el archivo se escribió correctamente
        await new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                console.log('File wrote successfully');
                resolve();
            });
            writeStream.on('error', reject);
        });

        // si hay un error, mostrarlo en la consola y rechazar la promesa
    } catch (err) {
        console.error('Error processing CSV file', err);
        throw err;
        // si todo sale bien, resolver la promesa
    } finally {
        return url;
    };
};

module.exports = createrFromCsv;