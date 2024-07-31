const express = require("express");
const cors = require("cors");
const app = express();
const uploads = require('./uploads.js');
const downloads = require('./downloads.js');
const { connection } = require('./conection.js');
const creaters = require("./creater.js");


//MIDLEWARE
app.use(express.json());
app.use(cors());


// Ruta Raíz
app.get("/", (req, res) => {
    res.send("welcome to my API")
});


app.use("/uploads", uploads);// Ruta para recibir archivos
app.use("/downloads", downloads)// Ruta para descargar archivos
app.use("/createData", creaters)// Ruta para generar datos
app.use("/conection", connection)// Ruta para conectar a la base de datos


// Puerto
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});