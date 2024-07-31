import React from 'react';
import { Link } from 'react-router-dom';


function Nav() {
    const Rutaservidor="/React_app"; 

    return (
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
            <div className="container-fluid">
                {/* Botón para desplegar el menú en pantallas pequeñas */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link btn btn-link" to={Rutaservidor}>File Upload</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link btn btn-link" to={Rutaservidor + "/createData"}>Create Data</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link btn btn-link" to={Rutaservidor + "/OLEDB"}>OLE DB</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};


export default Nav;
