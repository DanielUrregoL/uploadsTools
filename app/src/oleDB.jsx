import React from 'react';
import ConectionForm from './conectionForm';

function OLEDB() {
    return (
        <>
            <div className="position-relative">
                <div className="position-absolute col-5 top-0 start-0 m-5">
                    <ConectionForm title="Origin Database" />
                </div>
                <div className="position-absolute col-5 top-0 end-0 m-5">
                    <ConectionForm title="Destiny Database" />
                </div>
            </div>

            <button className="btn btn-primary position-absolute mb-5 bottom-0 start-50 translate-middle-x">Transfer Data</button>
        </>
    )
};

export default OLEDB;