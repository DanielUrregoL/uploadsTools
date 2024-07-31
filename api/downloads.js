const express = require("express");
const downloads = express.Router();
const path = require('path');

// Ruta para descargar el archivo de errores
downloads.get('/err/:file', (req, res) => {
  console.log('Descargando archivo...');
  const file = req.params.file; // Obtiene el nombre del archivo de los parámetros de la ruta
  const filePath = path.join(__dirname, 'Errores', file);
  res.download(filePath, file, (err) => { // Usa el nombre del archivo original en lugar de 'Errores.txt'
      if (err) {
          console.error('Error al descargar el archivo:', err);
          res.status(500).send('Hubo un error al descargar el archivo.');
      } else {
          console.log('Archivo descargado exitosamente.');
      }
  });
});

// Ruta para descargar el archivo CSV
downloads.get('/creater/:file', (req, res) => {
    console.log('Descargando archivo...');
    const file = req.params.file; // Obtiene el nombre del archivo de los parámetros de la ruta
    const filePath = path.join(__dirname, 'CsvFiles', file);
    res.download(filePath, file, (err) => { // Usa el nombre del archivo original en lugar de 'Errores.txt'
        if (err) {
            console.error('Error al descargar el archivo:', err);
            res.status(500).send('Hubo un error al descargar el archivo.');
        } else {
            console.log('Archivo descargado exitosamente.');
        }
    });
  });

module.exports = downloads;