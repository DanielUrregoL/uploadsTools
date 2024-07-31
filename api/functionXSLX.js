const fs = require('fs');
//const readXlsxFile = require('read-excel-file/node');
const primaryFuntion = require('./primaryFuntion.js');
const XLSX = require('xlsx');

/*
const ExcelJS = require('exceljs');

function loadXslxFile(file, tableStructure, config) {
    return new Promise((resolve, reject) => {
        const workbook = new ExcelJS.stream.xlsx.WorkbookReader();
        const rows = [];
        let chunk = [];
        const chunkSize = 1000;
      
        workbook.read(file.path, { entries: "emit", worksheets: ["emit"] });
        workbook.on('worksheet', worksheet => {
            if (worksheet.name !== workbook.SheetNames[1]) return;

            worksheet.on('row', row => {
                const rowObj = [];
                row.eachCell((cell, colNumber) => {
                    if (cell.type === ExcelJS.ValueType.SharedString) {
                        rowObj[colNumber] = cell.text;
                    } else if (cell.type === ExcelJS.ValueType.Formula) {
                        rowObj[colNumber] = cell.result;
                    } else {
                        rowObj[colNumber] = cell.value;
                    }
                });
                chunk.push(rowObj);
                if (chunk.length === chunkSize) {
                    rows.push(chunk);
                    chunk = [];
                }
            });

            worksheet.on('end', () => {
                if (chunk.length > 0) {
                    rows.push(chunk);
                }
                console.log("loadXslxFile.js cargado");
                primaryFuntion(tableStructure, config, rows, resolve, reject);
            });
        });

        workbook.on('error', reject);
          });
};

module.exports = loadXslxFile;

*/

// Función para cargar un archivo XLSX a una tabla de la base de datos
function loadXslxFile(file, tableStructure, config) {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(file.path);
        const buffers = [];
        stream.on('data', (data) => {
            buffers.push(data);
        });
        stream.on('end', () => {
            // Convertir los fragmentos en un solo buffer
            const buffer = Buffer.concat(buffers);
            // Leer el archivo XLSX
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            console.log("leyendo archivo XLSX")
            // Obtener la primera hoja del archivo
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            if (!worksheet) {
                console.error('The first sheet in the XLSX file is empty.');
                reject('The first sheet in the XLSX file is empty.');
                return;
            }
            // Convertir la hoja en un arreglo de objetos
            console.log('worksheet', worksheet);
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log('rows', rows);
            // rows = rows.map(row => Object.values(row).map(item => item === '' ? null : item));

            console.log("loadXslxFile.js cargado")
            primaryFuntion(tableStructure, config, rows, resolve, reject);

        });
        stream.on('error', reject);

    });
};

module.exports = loadXslxFile;

