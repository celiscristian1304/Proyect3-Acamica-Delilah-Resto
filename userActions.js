const serverData = require('./server');
const connectionData = require('./connection');
const { request } = require('express');
const cryptoJs = require("crypto-js");
const jwt = require('jsonwebtoken');
/* const expressJwt = require('express-jwt'); */
require('dotenv').config();
const passAes = "secret key 123";
const tokenVerify = require('./tokenVerify');

serverData.server.use(serverData.express.json());

/* Function to use in all endpoints except user login and register */
function middlewareVerifyJwt(req,res,next) {
    const tokenToApprove = tokenVerify.verify(req.headers);
    if(tokenToApprove === 401){
        res.status(401);
        res.send("You are not authenticated. Please authenticate and try again.");
    }else if(!tokenToApprove.user || !tokenToApprove.idUser || !tokenToApprove.rol || !tokenToApprove.iat){
        res.status(400);
        res.send(`Access denied. The json web token has a problem for the following reason: ${tokenToApprove}.`);
    }else{
        next();
    };
};

function middlewareRolAdmin(req,res,next) {
    const tokenToApprove = tokenVerify.verify(req.headers);
    if(tokenToApprove.rol == 1){
        next();
    }else{
        res.status(403);
        res.send("No access permissions. Contact the administrator to resolve the issue.");
    };
};

function middlewareRolUser(req,res,next) {
    const tokenToApprove = tokenVerify.verify(req.headers);
    if(tokenToApprove.rol == 0){
        next();
    }else{
        res.status(403);
        res.send("No access permissions. Contact the administrator to resolve the issue.");
    };
};

/* POST - Create a new customer user ----------------------------------------------------------------------------------------- */

serverData.server.post("/user/register", (req,res) => {
    const {user,fullName,mail,countryIndicator,phone,adress,password} = req.body;
    const newUser = {
        user,
        fullName,
        mail,
        countryIndicator,
        phone,
        adress,
        password
    };
    const cypherPass = cryptoJs.AES.encrypt(newUser.password,passAes).toString();

    if(!newUser.user || !newUser.fullName || !newUser.mail || !newUser.countryIndicator || !newUser.phone || !newUser.adress || !newUser.password){
        res.status(400);
        res.send("The information is incomplete, please verify that all the information is sent.");
    }else{
        connectionData.sequelize.query(`SELECT * FROM user WHERE user = :_user`,
        {replacements:{_user: newUser.user}, type: connectionData.sequelize.QueryTypes.SELECT})
        .then((queryresult) => {
            if(queryresult.length != 0){
                res.status(409);
                res.send("User is not available, please try another user.");
            }else{
                connectionData.sequelize.query(`INSERT INTO user (user,fullName,mail,countryIndicator,phone,adress,password) VALUES (:_user,:_fullName,:_mail,:_countryIndicator,:_phone,:_adress,:_password)`,
                {replacements:{
                    _user: newUser.user,
                    _fullName: newUser.fullName,
                    _mail: newUser.mail,
                    _countryIndicator: newUser.countryIndicator,
                    _phone: newUser.phone,
                    _adress: newUser.adress,
                    _password: cypherPass
                }, type: connectionData.sequelize.QueryTypes.INSERT})
                .then((queryresult) => {
                    res.status(201);
                    res.send(`User '${newUser.user}' was created successfully.`);
                });
            };
        });
    };
});

/* POST - Create a new admin user ----------------------------------------------------------------------------------------- */

serverData.server.post("/user/register/admin", (req,res) => {
    const {user,fullName,mail,countryIndicator,phone,adress,password} = req.body;
    const newUser = {
        user,
        fullName,
        mail,
        countryIndicator,
        phone,
        adress,
        password
    };
    const cypherPass = cryptoJs.AES.encrypt(newUser.password,passAes).toString();

    if(!newUser.user || !newUser.fullName || !newUser.mail || !newUser.countryIndicator || !newUser.phone || !newUser.adress || !newUser.password){
        res.status(400);
        res.send("The information is incomplete, please verify that all the information is sent.");
    }else{
        connectionData.sequelize.query(`SELECT * FROM user WHERE user = :_user`,
        {replacements:{_user: newUser.user}, type: connectionData.sequelize.QueryTypes.SELECT})
        .then((queryresult) => {
            if(queryresult.length != 0){
                res.status(409);
                res.send("User is not available, please try another user.");
            }else{
                connectionData.sequelize.query(`INSERT INTO user (user,fullName,mail,countryIndicator,phone,adress,password,rol) VALUES (:_user,:_fullName,:_mail,:_countryIndicator,:_phone,:_adress,:_password,:_rol)`,
                {replacements:{
                    _user: newUser.user,
                    _fullName: newUser.fullName,
                    _mail: newUser.mail,
                    _countryIndicator: newUser.countryIndicator,
                    _phone: newUser.phone,
                    _adress: newUser.adress,
                    _password: cypherPass,
                    _rol: 1
                }, type: connectionData.sequelize.QueryTypes.INSERT})
                .then((queryresult) => {
                    res.status(201);
                    res.send(`User '${newUser.user}' was created successfully.`);
                });
            };
        });
    };
});

/* POST - Login a user ----------------------------------------------------------------------------------------- */

serverData.server.post("/user/login", (req,res) => {
    const {user,password} = req.body;
    const userLogin = {user,password};

    if(!userLogin.user || !userLogin.password){
        res.status(400);
        res.send("The information is incomplete, please verify that all the information is sent.");
    }else{
        connectionData.sequelize.query(`SELECT * FROM user WHERE user = :_user`,
        {replacements:{_user: userLogin.user}, type: connectionData.sequelize.QueryTypes.SELECT})
        .then((queryresult) => {
            if(queryresult.length === 0){
                res.status(400);
                res.send("User or password is incorrect.");
            }else{
                const bytes = cryptoJs.AES.decrypt(queryresult[0].password,passAes);
                const originalPass = bytes.toString(cryptoJs.enc.Utf8);
                if(originalPass === userLogin.password){
                    const token = jwt.sign({
                        "user": userLogin.user,
                        "idUser": queryresult[0].idUser,
                        "rol": queryresult[0].rol
                    }, process.env.KEY_JWT, {algorithm: 'HS512'});
                    res.status(200);
                    res.json(token);
                }else{
                    res.status(400);
                    res.send("User or password is incorrect.");
                };
            };
        });
    };
});

/* GET - Get only personal data per user ----------------------------------------------------------------------------------------- */

serverData.server.get("/user/myInfo", middlewareVerifyJwt, middlewareRolUser, (req,res) => {
    const auth = req.headers.authorization;
    const tokenBearer = auth.substring(7,auth.length);
    const userKey = jwt.verify(tokenBearer,process.env.KEY_JWT);
    connectionData.sequelize.query(`SELECT * FROM user WHERE idUser = :_idUser AND user = :_user`,
    {replacements:{_idUser: userKey.idUser,_user: userKey.user}, type: connectionData.sequelize.QueryTypes.SELECT})
    .then((queryresult) => {
        const bytes = cryptoJs.AES.decrypt(queryresult[0].password,passAes);
        queryresult[0].password = bytes.toString(cryptoJs.enc.Utf8);
        
        res.status(200);
        res.json(queryresult[0]);
    });
});

/* GET - Get all users ----------------------------------------------------------------------------------------- */

serverData.server.get("/user", middlewareVerifyJwt, middlewareRolAdmin, (req,res) => {
    connectionData.sequelize.query(`SELECT * FROM user`, {type: connectionData.sequelize.QueryTypes.SELECT})
    .then((queryresult) => {
        for (let index = 0; index < queryresult.length; index++) {
            let bytes = cryptoJs.AES.decrypt(queryresult[index].password,passAes);
            queryresult[index].password = bytes.toString(cryptoJs.enc.Utf8);
        };
        
        res.status(200);
        res.json(queryresult);
    });
});