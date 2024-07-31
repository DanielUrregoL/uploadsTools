const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const sql = require('mssql');
const { randomInt } = require('crypto');
const { getConfig } = require('./conection');



function addTimeToDate(date, period, k) {
    let newDate = new Date(date);
    const periodMap = {
        'Daily': () => newDate.setDate(newDate.getDate() + k),
        'Weekly': () => newDate.setDate(newDate.getDate() + (7 * k)),
        'Monthly': () => newDate.setMonth(newDate.getMonth() + k),
        'Quarterly': () => newDate.setMonth(newDate.getMonth() + (3 * k)),
        'Annually': () => newDate.setFullYear(newDate.getFullYear() + k)
    };
    periodMap[period]();
    return newDate;
}

function randomFloat(min, max, decimalPlaces = 2) {
    const precision = Math.pow(10, decimalPlaces);
    return Math.round((min + Math.random() * (max - min)) * precision) / precision;
}

async function createrRandom(numbersOfRecords, headers, period, check) {


    try {

        const periodTimeMap = { 'Daily': 30, 'Weekly': 4, 'Monthly': 6, 'Quarterly': 4, 'Annually': 2 };
        const periodTime = periodTimeMap[period] || 0;

        let rows = [];
        let head = headers.map(header => header.value).join(','); // Obtener los valores de las cabeceras
        let ranges = headers.map(header => header.range.split(',')); // Convertir los rangos a arrays numéricos
        const headersLength = headers.length;
        console.log('Cabecera:', head);
        console.log('Rango:', ranges);
        console.log('periodo', period);
        let id_dato = 0;
        // Insertar las filas requeridas en un nuevo array 
        for (let k = 0; k < periodTime; k++) {
            for (let i = 0; i < numbersOfRecords; i++) {
                let row = [];
                for (let j = 0; j < headersLength; j++) {
                    if (headers[j].value === 'IdDatoFuente') {
                        row.push(id_dato);
                        id_dato++;
                    }
                    else if (headers[j].value === 'FechaDatos') {
                        let date = new Date();
                        date = addTimeToDate(date, period, k);
                        const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
                        row.push(formattedDate);
                    }
                    else if (headers[j].value === 'guid') {
                        row.push('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                            let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                            return v.toString(16);
                        }));
                    }
                    else if (headers[j].type === 'number') {
                        // Check if the range includes decimal values
                       if (ranges[j][0].toString().includes('.') || ranges[j][1].toString().includes('.')) {
                            const min = parseFloat(ranges[j][0]);
                            const max = parseFloat(ranges[j][1]);
                            const decimalPlaces = Math.max(ranges[j][0].toString().split('.')[1]?.length || 0, ranges[j][1].toString().split('.')[1]?.length || 0);
                            row.push(randomFloat(min, max, decimalPlaces));
                        } else {
                            ranges[j][0] = parseInt(ranges[j][0]);
                            ranges[j][1] = parseInt(ranges[j][1]);
                            row.push(randomInt(ranges[j][0], ranges[j][1] + 1));
                        }
                    }
                    else if (headers[j].type === 'date') {
                        let parts = ranges[j][0].split('/'); // Split the date string
                        let parsedDate = new Date(parts[2], parts[1] - 1, parts[0]); // Months are 0-indexed
                        let newDate = addTimeToDate(parsedDate, period, k).toISOString().split('T')[0];
                        row.push(newDate.split('-').reverse().join('/'));
                    }
                    else if (headers[j].type === 'string') {
                        row.push(ranges[j][randomInt(0, ranges[j].length)]);
                    }
                    else if (headers[j].type === 'boolean') {
                        row.push(randomInt(0, 1));
                    }


                }; // for J
                rows.push(row.join(','));
            }; // for I

            if (check) {
                await insertDataDB(head, rows);
                rows = [];
            }

        };// for K


        if (!check) {
            await createCsv(head, rows);
            rows = [];
        }
        rows = [];


        // si hay un error, mostrarlo en la consola y rechazar la promesa
    } catch (err) {
        console.error('Error', err);
        throw err;
        // si todo sale bien, resolver la promesa
    } finally {
        return 'process was successfully';
    };
};

// Funcion para insertar los datos en la base de datos
async function insertDataDB(head, rows) {
    // const pool = mysql.createPool(getConfig());
    let connectionObj = getConfig();
    let connection;
    console.log(connectionObj);

    const columns = head.split(',');
    const tableName = connectionObj.table;

    if (connectionObj.config.server == undefined) {
        // Insertar data en MySQL
        try {
            connection = await mysql.createConnection(connectionObj.config);
            const baseSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ?`;
            const batchSize = 500000;
            let promises = [];
            const rowsLength = rows.length;
            console.log('inserting_data...')

            for (let i = 0; i < rowsLength; i += batchSize) {
                const batchRows = rows.slice(i, i + batchSize).map(row => row.split(','));
                promises.push(
                    (async () => {
                        await connection.beginTransaction();
                        await connection.query(baseSql, [batchRows]);
                        await connection.commit();
                    })()
                );
                await Promise.all(promises);
                console.log('Data inserted successfully');
                promises = [];
            };

         
        } catch (err) {
            console.error('Connection error:', err);
        } finally {
            console.log('ci')
           // connection.end();
        }
    } else {
        // Insertar data en SQL Server
        try {

            // SQL Server
            const batchSize = 500000;
           // const pool = await sql.connect(connectionObj.config);
            const transaction = new sql.Transaction();

            const chunkArray = (array, size) =>
                Array.from({ length: Math.ceil(array.length / size) }, (v, i) =>
                    array.slice(i * size, i * size + size)
                );

            const rowChunks = chunkArray(rows, batchSize);
            
            let promises = [];
            for (const chunk of rowChunks) {
                await transaction.begin();
                
                const table = new sql.Table(tableName);
                table.create = false;        

                columns.forEach(column => {
                    table.columns.add(column, sql.VarChar(sql.MAX), { nullable: true });
                });

                chunk.forEach(row => {
                    const values = row.split(',').map(value => value.replace(/'/g, "''"));
                    table.rows.add(...values);
                });

                const request = new sql.Request(transaction);
                promises.push(
                    (async () => {
                        await request.bulk(table);
                        await transaction.commit();
                    })()
                );

                console.log('Data inserted successfully');
                await Promise.all(promises);
                promises = [];
            }
       

        } catch (err) {
            console.error('Error inserting data:', err);
        } finally {
            console.log('ci')
        }
    };
};

// Función para crear un archivo CSV
async function createCsv(head, rows) {
    let url = '';
    try {
        // Crear un directorio para guardar el archivo csv si no existe
        const folder = path.join(__dirname, 'CsvFiles');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        // Crear un archivo CSV con las filas requeridas
        console.log('numero de filas', rows.length);
        console.log('Writing CSV file...');
        let CsvFilePath = path.join(folder, 'CSV.csv');
        let counter = 0;
        while (fs.existsSync(CsvFilePath)) {
            counter++;
            CsvFilePath = path.join(folder, `CSV${counter}.csv`);
        }

        const writeStream = fs.createWriteStream(CsvFilePath);
        const fileName = CsvFilePath.split(path.sep).pop();
        url = `http://localhost:9000/downloads/creater/${fileName}`;
        writeStream.write(head + '\n');


        // Función para escribir el archivo en chunks
        let i = 0;
        const chunkSize = 10000;
        function writeInBlocks() {
            let ok = true;
            while (i < rows.length && ok) {
                const chunk = rows.slice(i, i + chunkSize).join('\n') + '\n';
                ok = writeStream.write(chunk);
                i += chunkSize;
            }
            if (i < rows.length) {
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
    } catch {
        console.log('error creando csv')
    } finally {
        return url
    }
};

module.exports = createrRandom;