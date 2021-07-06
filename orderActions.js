const serverData = require('./server');
const connectionData = require('./connection');
const { request, query } = require('express');
const tokenVerify = require('./tokenVerify');
const jwt = require('jsonwebtoken');
const moment = require('moment');
require('dotenv').config();

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

/* POST - Create a new order --------------------------------------------------------------------------------------- */

serverData.server.post("/order", middlewareVerifyJwt, middlewareRolUser, async (req,res) => {

    /* Get id user */
    const token = req.headers.authorization.substring(7,req.headers.authorization.length);
    const userInfo = jwt.verify(token,process.env.KEY_JWT);

    /* Get data from body */
    const {methodPayment,deliveryAddress,items} = req.body;
    const newOrder = {
        methodPayment,
        deliveryAddress,
        items
    };

    if(!newOrder.methodPayment || !newOrder.deliveryAddress || !newOrder.items){
        res.status(400);
        res.send("Information incomplete. Please check that the methodPayment, deliveryAddress and the items were sent correctly.");
        return;
    }else if(typeof(newOrder.items) != "object"){
        res.status(400);
        res.send("The items are not an array. Please send the items such as array.");
        return;
    }

    /* Get date and hour for the order, to military hour I have to start the time with HH, and hh to 12 hour format */
    const date = moment().format('YYYY-MM-DD HH:mm:ss');

    /* Get total items price and price per product */
    let total = 0;
    const priceProduct = [];
    let cont = 0;
    for(let item of items){
        /* Await only works with async in the function, so in the callback I have to put async before (req,res) */
        let priceItem = await connectionData.sequelize.query(`SELECT price FROM product WHERE idProduct = :_idProduct`, {replacements:{_idProduct: item}, type: connectionData.sequelize.QueryTypes.SELECT});
        /* With 'Number' I can convert any value to a respective number */
        total += Number(priceItem[0].price);
        priceProduct[cont] = priceItem[0].price
        cont += 1;
    };

    /* Information to send to the database that was not sent through the body */
    const idUser = userInfo.idUser;
    
    /* INSERT data to order */
    connectionData.sequelize.query(`INSERT INTO ${process.env.DB_NAME}.order (idUser,methodPayment,total,deliveryAddress,date) VALUES (:_idUser,:_methodPayment,:_total,:_deliveryAddress,:_date)`,
    {replacements:{
        _idUser: idUser,
        _methodPayment: newOrder.methodPayment,
        _total: total,
        _deliveryAddress: newOrder.deliveryAddress,
        _date: date
    }, type: connectionData.sequelize.QueryTypes.INSERT})
    .then(async (queryresult) => {
        const idOrder = await connectionData.sequelize.query(`SELECT MAX(idOrder) AS lastOrder FROM ${process.env.DB_NAME}.order`, { type: connectionData.sequelize.QueryTypes.SELECT});
        cont = 0;
        for(let item of items){
            await connectionData.sequelize.query(`INSERT INTO ${process.env.DB_NAME}.itemOrder (idOrder,idProduct,price) VALUES (:_idOrder,:_idProduct,:_price)`, {replacements:{_idOrder: idOrder[0].lastOrder,_idProduct: item,_price: priceProduct[cont]}, type: connectionData.sequelize.QueryTypes.INSERT});
            cont += 1;
        };

        res.status(201);
        res.send(`Order created successfully.`);
    });
});

/* GET - Get all orders with their respective products --------------------------------------------------------------------------------------- */

serverData.server.get("/order", middlewareVerifyJwt, async (req,res) => {

    /* Segment by role */
    const token = req.headers.authorization.substring(7,req.headers.authorization.length);
    const userInfo = jwt.verify(token,process.env.KEY_JWT);

    let ordersWithItems = [];
    let orders = Promise;

    if(userInfo.rol == 1){
        /* Get all orders with user information */
        orders = await connectionData.sequelize.query(`
        SELECT o.idOrder,o.status,o.methodPayment,o.total,o.deliveryAddress,o.date,u.idUser,u.user,u.fullName,u.mail,u.countryIndicator,u.phone,u.adress AS userAdress
        FROM ${process.env.DB_NAME}.order AS o
        LEFT JOIN user AS u
        ON o.idUser = u.idUser`, { type: connectionData.sequelize.QueryTypes.SELECT});
    }else if(userInfo.rol == 0){
        /* Get all orders by an user logged */
        orders = await connectionData.sequelize.query(`
        SELECT o.idOrder,o.status,o.methodPayment,o.total,o.deliveryAddress,o.date,u.idUser,u.user,u.fullName,u.mail,u.countryIndicator,u.phone,u.adress AS userAdress
        FROM ${process.env.DB_NAME}.order AS o
        LEFT JOIN user AS u
        ON o.idUser = u.idUser
        WHERE o.idUser = :_idUser`, {replacements:{_idUser: userInfo.idUser}, type: connectionData.sequelize.QueryTypes.SELECT});
    }

    /* Load array 'ordersWithItems' with the required information */
    for (let index = 0; index < orders.length; index++) {
        /* Create a new object for each array index */
        let objectOrders = new Object();
        objectOrders.order = orders[index];
        objectOrders.itemsOrder = await connectionData.sequelize.query(`
        SELECT i.idItem,p.idProduct,p.dish,p.image,i.price AS priceOrdered
        FROM itemorder AS i
        LEFT JOIN product AS p
        ON i.idProduct = p.idProduct
        WHERE i.idOrder = :_idOrder`, {replacements:{_idOrder: orders[index].idOrder}, type: connectionData.sequelize.QueryTypes.SELECT});

        /* Put each object created in an array index */
        ordersWithItems[index] = objectOrders;
    };

    res.status(200);
    res.json(ordersWithItems);
});

/* PUT - Update order status by admin --------------------------------------------------------------------------------------- */

serverData.server.put("/order/:status/:idOrder", middlewareVerifyJwt, middlewareRolAdmin, async (req,res) => {
    const status = req.params.status.toUpperCase();
    const idOrder = req.params.idOrder;

    const idOrderExist = await connectionData.sequelize.query(`SELECT * FROM ${process.env.DB_NAME}.order WHERE idOrder = :_idOrder`, {replacements:{_idOrder: idOrder}, type: connectionData.sequelize.QueryTypes.SELECT});
    if(idOrderExist.length === 0){
        res.status(404);
        res.send("The idOrder does not exist. Please send a valid idOder.");
        return;
    };

    connectionData.sequelize.query(`UPDATE ${process.env.DB_NAME}.order SET status = :_status WHERE idOrder = :_idOrder`, {replacements:{_status: status, _idOrder: idOrder}, type: connectionData.sequelize.QueryTypes.UPDATE})
    .then((queryresult) => {
        res.status(200);
        res.send("Update done.");
    });
});