const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const express = require("express");
const http = require('http');
const downloads = express.Router();

let url = '';
// Función para convertir los tipos de datos de una fila según la estructura de la tabla
function convertRowTypes(row, tableStructure) {
    return row.map((cell, index) => {
        const column = tableStructure[index];
        if (!column) return cell; // Si no hay definición de columna, retorna el valor original

        // Determinar el tipo de SQL Server y convertir adecuadamente
        if (column.type === sql.VarChar || column.type === sql.Char) {
            return cell.toString(); // Convertir a string
        } else if (column.type === sql.Int) {
            return parseInt(cell, 10); // Convertir a entero
        } else if (column.type === sql.Float) {
            return parseFloat(cell); // Convertir a flotante
        } else if (column.type === sql.Bit) { // Usar sql.Bit para booleanos
            return cell.toLowerCase() === 'true'; // Convertir a booleano
        } else {
            return cell; // Por defecto retorna el valor sin cambios
        }
    });
}


// Funcion para validar los datos de una fila (cada fila es un arreglo)
function validateRow(row) {
    console.log('validating row:', row);
    const validatedRow = [];
    const isValid = row.every(cell => {
        console.log('tipo de cell:', typeof cell)
        if (typeof cell === 'string' && cell.length <= 255) {
            validatedRow.push(cell);
            console.log('string validado')
            return true;
        } else if (typeof cell === 'number' && Number.isInteger(cell)) {
            validatedRow.push(cell);
            console.log('number validado')
            return true;
        } else if (cell === null || cell === undefined) {
            validatedRow.push('');
            console.log('null validado')
            return true;
        } else {
            console.log('cell invalida ' + cell)
            return false;
        }

    });

    return { isValid, validatedRow, row };
}

// Funcion para insertar los datos en la base de datos
async function primaryFunction(tableStructure, config, rows, resolve, reject) {
    const pool = new sql.ConnectionPool(config);
    try {
        await pool.connect();
        const chunkSize = 50000;
        const bulkPromises = rows.reduce((acc, row, index) => {
            if (index % chunkSize === 0) acc.push([]);
            acc[acc.length - 1].push(row);
            return acc;
        }, []).map(chunk => processChunk(chunk, tableStructure, pool));

        await Promise.all(bulkPromises);
        console.log('All bulk operations completed, file successfully processed');
        resolve('File processed successfully');
        console.log('url', url)
    } catch (err) {
        console.log('Error:', err);
        reject('hubo un error');
    } finally {
        pool.close();
        return url
    }
}



// Funcion para procesar los datos en la base de datos
async function processChunk(chunkRows, tableStructure, pool) {
    const table = new sql.Table('PersonasDaul');
    tableStructure.forEach(column => {
        table.columns.add(column.name, column.type, { nullable: column.nullable, primary: column.primary });
    });

    let invalidRows = [];
    chunkRows.forEach(row => {
        // Convertir los tipos de datos de la fila antes de validar e insertar
        const validationResult = validateRow(convertRowTypes(row, tableStructure));
        if (validationResult.isValid) {
            table.rows.add(...validationResult.validatedRow);
        } else {
            invalidRows.push(validationResult.row);
        }
    });

    if (invalidRows.length > 0) {
        console.log('Invalid rows:', invalidRows);

        const erroresDir = path.join(__dirname, 'Errores');
        if (!fs.existsSync(erroresDir)) {
            fs.mkdirSync(erroresDir, { recursive: true });
        }

        console.log('Generating error file for invalid rows');
        let errorsFilePath = path.join(erroresDir, 'Errores.txt');
        let counter = 0;
        while (fs.existsSync(errorsFilePath)) {
            counter++;
            errorsFilePath = path.join(erroresDir, 'Errores' + counter + '.txt');
        }

        const errorsFile = fs.createWriteStream(errorsFilePath);
        errorsFile.write(invalidRows.map(row => row.join(',')).join('\n'), () => {
            errorsFile.close();
            const fileName = errorsFilePath.split(path.sep).pop();
            url = `http://localhost:9000/downloads/err/${fileName}`; 

        });
    }

    console.log('Invalid rows:', invalidRows.length);
    console.log('Valid rows:', table.rows.length);


    const request = new sql.Request(pool);
    await request.bulk(table);
    console.log('Chunk successfully processed');
}


module.exports = primaryFunction, url;
