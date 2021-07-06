const mysql = require('mysql2/promise');
const Sequelize = require('sequelize');
require('dotenv').config();

/* Info to export */
const data = { 
    host : process.env.DB_HOST, 
    port : process.env.DB_PORT, 
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD
};

const name = process.env.DB_NAME;

/* Info to export */
const path = `mysql://${data.user}:${data.password}@${data.host}:${data.port}/${name}`;

(async function (){
    const connection = await mysql.createConnection(data);
    console.log('Conected to MySQL server');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${name};`);
    console.log(`Database created (${name})`);
})();

/* Info to export */
const sequelize = new Sequelize( path , { logging : false } );

sequelize.authenticate().then(() => {
    console.log(`Conected to database (${name})`);
}).catch(err => {
    console.error('Error connection:', err);
}).finally(() => {
    //sequelize.close();
});

connectionData = {data,path,sequelize};

module.exports = connectionData;