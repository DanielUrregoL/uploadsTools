import React from 'react';

function ConectionForm({ title }) {
    return (
        <div className="mb-3">
            <h3>{title}</h3>
            <label htmlFor="server" className="form-label">Server</label>
            <input type="text" className="form-control" id="server" />
            <label htmlFor="port" className="form-label">Port</label>
            <input type="text" className="form-control" id="port" />
            <label htmlFor="user" className="form-label">User</label>
            <input type="text" className="form-control" id="user" />
            <label htmlFor="password" className="form-label">Password</label>
            <input type="text" className="form-control" id="password" />
            <label htmlFor="database" className="form-label">Database</label>
            <input type="text" className="form-control" id="database" />
            <label htmlFor="table" className="form-label">Table</label>
            <input type="text" className="form-control" id="table" />
            <label htmlFor="type" className="form-label">Type</label>
            <select className="form-select" aria-label="Default select example" id='type'>
                <option value="1">MySQL</option>
                <option value="2">SQLServer</option>
            </select>
        </div>
    );
};

export default ConectionForm;