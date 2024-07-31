const sql = require('mssql');

function transferData(tableStructure, configDestino, configOrigen) {
    let internalPool;
    let externalPool;

    return new Promise(async (resolve, reject) => {
        try {
            externalPool = new sql.ConnectionPool(configDestino);
            await externalPool.connect();
            console.log('Connected to external SQL Server');
            console.log(externalPool.config);

            internalPool = new sql.ConnectionPool(configOrigen);
            await internalPool.connect();
            console.log('Connected to internal SQL Server');
            console.log(internalPool.config);

            const result = await internalPool.request().query('SELECT * FROM PersonasDaul');
            console.log(result);
            const data = result.recordset;

            const table = new sql.Table('personasDaul');
            tableStructure.forEach(column => {
                table.columns.add(column.name, column.type, { nullable: column.nullable });
            });

            data.forEach(row => {
                const rowValues = tableStructure.map(column => row[column.name]);
                table.rows.add(...rowValues);
            });

            const request = externalPool.request(); // Asegúrate de que esto esté definido correctamente
            await request.bulk(table);
            console.log('Data transferred successfully');

            resolve();
        } catch (err) {
            console.error('Error during the data transfer:', err);
            reject(err);
        } finally {
            internalPool?.close();
            externalPool?.close();
        }
    });
};

module.exports = transferData;