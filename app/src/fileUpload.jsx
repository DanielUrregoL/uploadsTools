import React, { useState, useEffect } from 'react';
//import { uploadFile, getData as fetchFromServer } from './function';
import { uploadFile, connect } from './function';
import Spinner from 'react-bootstrap/Spinner';
import ConectionForm from './conectionForm';
import Footer from './footer';

// Componente para subir archivos
function FileUpload() {
  // variables de estado
  const [files, setFiles] = useState([null]);
  const [isUploading, setIsUploading] = useState(false);
  const [data, setData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [config, setConfig] = useState({
    server: '',
    port: '',
    user: '',
    password: '',
    database: ''
  });
  // Enviar archivos a funtion.js
  const submitFiles = () => {
    setIsUploading(true);
    files.forEach(file => {
      if (file) {
        uploadFile(file, () => {}, () => { setIsUploading(false); })
      } else {
        alert('No hay archivos seleccionados');
        setIsUploading(false);
      }
    });
  };


  /*
  // Obtener datos del servidor
  const getData = () => {
    fetchFromServer()
      .then(dataFromServer => {
        setData(dataFromServer);
      })
      .catch(error => {
        console.error(error);
      });
    console.log(data);
  };

  useEffect(() => {
    getData();
  }, []);
  */


  // Manejar el cambio de archivo
  const handleFileChange = (index) => (event) => {
    const newFiles = [...files];
    newFiles[index] = event.target.files[0];
    setFiles(newFiles);
  };
  // Agregar Input de archivo
  const addMore = () => {
    setFiles([...files, null]);
  };
  // Eliminar Input de archivo
  const remove = (index) => () => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  // Mostrar u ocultar la tabla
  const handleShowTable = () => {
    setShowTable(!showTable);
  };
  // Renderizar la tabla
  const renderTable = () => {
    if (!showTable) {
      return null;
    }
    if (data.length === 0) {
      return <p>No data</p>;
    }
    return (
      <div className="table-responsive small">
        <table className="table table-bordered table-dark">
          <thead>
            <tr>
              {Object.keys(data[0]).map((key, index) => (
                <th key={index}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleConnect = () => {
    const server = document.getElementById('server').value;
    const port = document.getElementById('port').value;
    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;
    const database = document.getElementById('database').value;
    const type = document.getElementById('type').value;
    const table = document.getElementById('table').value;
    
    setConfig({ server, port, user, password, database, type, table });
    console.log(config)
  };

  useEffect(() => {
    // Esta función se ejecutará cada vez que `config` cambie.
    // Aquí puedes llamar a `connect` o cualquier otra función que necesite usar los valores actualizados de `config`.
    if (config.server && config.port && config.user && config.password && config.database) {
      console.log("Configuración actualizada", config);
      connect(config , () => {}, () => { setIsUploading(false); });
    }
  }, [config]); // La lista de dependencias indica que este efecto se ejecuta solo cuando `config` cambia.

  

  return (
    <>
      <div className="container">
        <h1 className="my-4 ">File Upload</h1>
        {/* Inputs de archivo */}
        
        <ConectionForm title="DB Conection" />
        <button className="btn btn-primary mb-2" onClick={handleConnect}>Connect</button>
          <h3>Upload Files</h3>
          {files.map((file, index) => (
            <div key={index} className="d-flex  mb-3" style={{ maxWidth: '300px' }}>
              <input type="file" className="form-control " onChange={handleFileChange(index)} />
              <button className="btn btn-danger ms-1" onClick={remove(index)}>Remove</button>
            </div>
          ))}
          {/* botones */}
          <div className="">
            <button className="btn btn-primary" onClick={submitFiles}>Submit</button>
            <button className="btn btn-secondary m-2" onClick={addMore}>Add More</button>
            <button className="btn btn-success" onClick={handleShowTable}>getData</button>
          </div>
       
        {/* Tabla */}
        <hr />
        {renderTable()}
        {/* Spinner */}
        {isUploading ? <Spinner animation="border" /> : null}
        <p style={{ fontSize: '16px' }} >@By Daniel UL</p>
        
      </div>
    </>
  );
};

export default FileUpload;