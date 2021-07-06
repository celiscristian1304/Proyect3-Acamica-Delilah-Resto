const { response } = require("express");
const express = require("express");
require('dotenv').config();
const server = express();

server.listen(process.env.APP_PORT, () => {
    console.log(`Server started on port ${process.env.APP_PORT}`);
});

serverData = {express,server};
module.exports = serverData;