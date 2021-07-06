const connectionData = require('./connection');
const tablesInitial = require('./tablesInitial');
require('dotenv').config();
require('./crudProductTable');
require('./userActions');
require('./orderActions');

let totalRows = 0;

(async function () {

    /* Create empty tables ------------------------------------------------------------------------------------------------------------------- */
    connectionData.sequelize.query(tablesInitial.product.createTable);
    console.log('Table product created');

    connectionData.sequelize.query(tablesInitial.user.createTable);
    console.log('Table user created');

    connectionData.sequelize.query(tablesInitial.order.createTable);
    console.log('Table order created');

    connectionData.sequelize.query(tablesInitial.item.createTable);
    console.log('Table item created');

    /* The following lines perform a query to check how many rows the product table in the database has and insert data if it is empty */
    connectionData.sequelize.query(`SELECT COUNT(*) AS 'TotalRows' FROM product`, { type: connectionData.sequelize.QueryTypes.SELECT })
    .then( (rows) => {
        totalRows = rows[0].TotalRows;
        if(totalRows === 0){
            console.log("Database product without data");
            connectionData.sequelize.query(tablesInitial.product.setValues);
            console.log('Records have been created for the first time (as minimal data) for product database');
        }else if(totalRows>0){
            console.log("The database product already has minimal data");
        }
    });

    /* The following lines perform a query to check how many rows the user table in the database has and insert data if it is empty */
    connectionData.sequelize.query(`SELECT COUNT(*) AS 'TotalRows' FROM user`, { type: connectionData.sequelize.QueryTypes.SELECT })
    .then( (rows) => {
        totalRows = rows[0].TotalRows;
        if(totalRows === 0){
            console.log("Database user without data");
            connectionData.sequelize.query(tablesInitial.user.setValues);
            console.log('Records have been created for the first time (as minimal data) for user database');
        }else if(totalRows>0){
            console.log("The database user already has minimal data");
        }
    });

    /* The following lines perform a query to check how many rows the order table in the database has and insert data if it is empty */
    connectionData.sequelize.query(`SELECT COUNT(*) AS 'TotalRows' FROM ${process.env.DB_NAME}.order`, { type: connectionData.sequelize.QueryTypes.SELECT })
    .then( (rows) => {
        totalRows = rows[0].TotalRows;
        if(totalRows === 0){
            console.log("Database order without data");
            connectionData.sequelize.query(tablesInitial.order.setValues);
            console.log('Records have been created for the first time (as minimal data) for order database');
        }else if(totalRows>0){
            console.log("The database order already has minimal data");
        }
    });

    /* The following lines perform a query to check how many rows the itemOrder table in the database has and insert data if it is empty */
    connectionData.sequelize.query(`SELECT COUNT(*) AS 'TotalRows' FROM ${process.env.DB_NAME}.itemOrder`, { type: connectionData.sequelize.QueryTypes.SELECT })
    .then( (rows) => {
        totalRows = rows[0].TotalRows;
        if(totalRows === 0){
            console.log("Database itemOrder without data");
            connectionData.sequelize.query(tablesInitial.item.setValues);
            console.log('Records have been created for the first time (as minimal data) for itemOrder database');
        }else if(totalRows>0){
            console.log("The database itemOrder already has minimal data");
        }
    });

    /* connection.end(); */ //this line closes the conection between DB and NodeJS 
})();