const express = require("express");
const creaters = express.Router();
const multer = require('multer');
const creater = multer({ dest: 'creater/' });
const createrFromCsv = require("./createrFromCsv");
const createrRandom = require("./createrRandom");


creaters.post('/', creater.single('file'), async (req, res) => { // Usa multer para manejar la subida de un archivo con el nombre 'file'
    const file = req.file;
    const numbersOfRecords = req.body.numbersOfRecords;
    const headers = req.body.headers;
    const period = req.body.period;
    const check = req.body.check;
    console.log('headers', headers);

    if (headers !== undefined) {
        try {
            const result = await createrRandom(numbersOfRecords, headers, period, check);
            res.status(200).send(result);
        } catch (err) {
            res.status(500).send(`Error creating random data: ${err.message}`);
        }
    } else {

        if (!file) {
            console.log('No file uploaded');
            res.status(400).send('No file uploaded');
            return;
        }
        // Si el archivo es de tipo CSV
        if (file.mimetype === 'text/csv') {
            try {
                const result = await createrFromCsv(file, numbersOfRecords, period, check);
                res.status(200).send(result);
            } catch (err) {
                res.status(500).send(`Error processing CSV file: ${err.message}`);
            }
        } else {
            res.status(400).send('File type not supported');
        }
    };

});

module.exports = creaters;