import axios from 'axios';

//const ServerRoute = process.env.REACT_APP_SERVER_ROUTE;
const ServerRoute = 'http://localhost:9000';
// Función para manejar el progreso de la subida de archivos
const handleUploadProgress = (progressEvent, onUploadStart) => {
    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    if (percentCompleted === 100) {
        onUploadStart();
    }
};


// Función para subir un archivo al servidor
const uploadFile = async (file, onUploadStart, onUploadEnd) => {
    const startTime = Date.now();
    try {

        // Crear una instancia de FormData para enviar archivos
        const formData = new FormData();
        // Verifica si el archivo es un .sql y asigna manualmente un tipo MIME
        if (file.name.endsWith('.sql')) {
            // Clona el archivo con un nuevo tipo MIME
            const fileWithMime = new File([file], file.name, { type: 'application/sql' });
            formData.append('file', fileWithMime);
        } else {
            formData.append('file', file);
        }

        let response = await axios.post(ServerRoute + '/uploads', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Es importante establecer este encabezado
            },
            onUploadProgress: (progressEvent) => handleUploadProgress(progressEvent, onUploadStart)
        });

        // Maneja la respuesta al subir el archivo
        const endTime = Date.now();
        const duration = endTime - startTime;
        alert("File processed successfully " + duration / 1000 + ' seconds');
        const url = response.data;
        window.location.href = url;
        onUploadEnd();
    }
    catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        alert(JSON.stringify(error.response.data) + " " + duration / 1000 + ' seconds');
        onUploadEnd();
    };
};


// funcion para obtener datos del servidor
/*
const getData = () => {
    return axios.get(ServerRoute + '/uploads')
        .then(response => {
            // La solicitud fue exitosa, puedes acceder a los datos de la respuesta aquí
            // console.log(response.data);
            return response.data; // Devuelve los datos aquí
        })
        .catch(error => {
            // Hubo un error con la solicitud, puedes manejar el error aquí
            alert(JSON.stringify(error.response.data));
            throw error; // Lanza el error para que pueda ser manejado en el componente
        });
};
*/

// Función para conectar a la base de datos
const connect = async (config, onUploadStart, onUploadEnd) => {
    const startTime = Date.now();
    try {
        let response = await axios.post(ServerRoute + '/conection', config, {
            onUploadProgress: (progressEvent) => handleUploadProgress(progressEvent, onUploadStart)
        });
        const endTime = Date.now();
        const duration = endTime - startTime;
        alert('Connection successful ' + duration / 1000 + ' seconds');
        console.log('res from', response.config.data);
        onUploadEnd();
    }
    catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        alert('Error connecting to the database ' + duration / 1000 + ' seconds');
        onUploadEnd();
        throw error;
    };
};

// Funcion para crear data
const createData = async (object, onUploadStart, onUploadEnd) => {
    const startTime = Date.now();
    try {
        let response;
        // Verifica si el objeto tiene headers
        if (object.headers.length === 0) {
            // Crear una instancia de FormData para enviar archivos
            const formData = new FormData();
            // Agregar el archivo y los números de registros al formData
            formData.append('file', object.file);
            formData.append('numbersOfRecords', object.numbersOfRecords);
            response = await axios.post(ServerRoute + '/createData', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Es importante establecer este encabezado
                },
                onUploadProgress: (progressEvent) => handleUploadProgress(progressEvent, onUploadStart)
            });
        } else {
            const data = {
                numbersOfRecords: object.numbersOfRecords,
                headers: object.headers.map(header => ({ value: header.value, type: header.type, range: header.range })),
                period: object.period,
                check: object.check
            };
            response = await axios.post(ServerRoute + '/createData', data, {
                onUploadProgress: (progressEvent) => handleUploadProgress(progressEvent, onUploadStart)
            })
        }
        // En caso de éxito 
        const url = response.data
        const endTime = Date.now();
        const duration = endTime - startTime;
        alert('Data created successfully ' + duration / 1000 + ' seconds');
       // window.location.href = url;
        onUploadEnd();
        // En caso de error 
    } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        alert('Error creating data ' + duration / 1000 + ' seconds');
        console.log('error', error);
        onUploadEnd();
        throw error;
    };
};
export { uploadFile, connect, createData };