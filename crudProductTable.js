const serverData = require('./server');
const connectionData = require('./connection');
const { request } = require('express');
const tokenVerify = require('./tokenVerify');

serverData.server.use(serverData.express.json());

/* Functions to use */

function idValidation(idProduct, productsArray){
    let productFiltered = [];
    /* The following line makes the filter by id */
    productFiltered = productsArray.filter(element => {
        return element.idProduct === parseInt(idProduct);
    });
    if(productFiltered.length === 0){
        return true;
    }else{
        return false;
    };
};

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

/* POST - Create of CRUD ---------------------------------------------------------------------------------------- */

/* Post a new product */
serverData.server.post("/products", middlewareVerifyJwt, middlewareRolAdmin, (req, res) => {
    let existingValue = false;
    const {dish,price,image} = req.body;
    const newProduct = {
        dish,
        price,
        image
    };

    /* Valite the data before insert */

    if(newProduct.dish === undefined || newProduct.price === undefined){
        res.status(400);
        res.send("The information is incomplete, please verify that at least the dish and the price are sent.");
    }else{
        let dishLowerCase = newProduct.dish.toLowerCase();
        /* The following line allows to simulate the "capitalize" function of CSS in JS, only for the first letter */
        let dishCapitalize = dishLowerCase.charAt(0).toUpperCase()+dishLowerCase.slice(1);   

        connectionData.sequelize.query(`SELECT dish FROM product WHERE dish = :_dish`,
        {replacements:{_dish: dishCapitalize}, type: connectionData.sequelize.QueryTypes.SELECT})
        .then((queryresult) => {
            if(queryresult.length != 0){
                existingValue = true;
            }else{
                existingValue = false;
            };

            if(isNaN(newProduct.price)){
                res.status(400);
                res.send("The price to insert is not a number, please check the value and make sure if it has a dot for decimal values.");
            }else if(existingValue){
                res.status(409);
                res.send("The name of the dish already exists, so please try another name. Note: Names are not case sensitive.");
            }else{
                connectionData.sequelize.query(`INSERT INTO product (dish,price,image) VALUES (:_dish,:_price,:_image)`,
                {replacements:{
                    _dish: dishCapitalize,
                    _price: newProduct.price,
                    _image: newProduct.image}, type: connectionData.sequelize.QueryTypes.INSERT})
                    .then(() => {
                        res.status(201);
                        res.send(`The dish "${dishCapitalize}" has been succesfully created in the product table of the database.`);
                    });
            };
        });
    };
});

/* GET - Read of CRUD-------------------------------------------------------------------------------------------- */

/* Get all products */
serverData.server.get("/products", middlewareVerifyJwt, (req, res) => {
    connectionData.sequelize.query(`SELECT * FROM product`, {type: connectionData.sequelize.QueryTypes.SELECT})
    .then((queryresult) => {
        res.status(200);
        res.json(queryresult);
    });
});

/* Get a specific product by its ID */
serverData.server.get("/products/:idProduct", middlewareVerifyJwt, (req, res) => {

    const idProduct = req.params.idProduct;

    connectionData.sequelize.query(`SELECT * FROM product WHERE idProduct = :_idProduct`,
    {replacements:{_idProduct: idProduct}, type: connectionData.sequelize.QueryTypes.SELECT})
    .then((queryresult) => {
        let notId = idValidation(idProduct, queryresult);
        if(notId){
            res.status(404);
            res.send("The ID product does not exist in database, please enter a valid ID.");
        }else{
            res.status(200);
            res.send(queryresult[0]);
        };
    });
});

/* PUT - Update of CRUD ---------------------------------------------------------------------------------------- */

/* Update product information */
serverData.server.put("/products/:idProduct", middlewareVerifyJwt, middlewareRolAdmin, (req, res) => {

    const idProduct = req.params.idProduct;
    const attribute = req.query.attribute;
    const value = req.query.value;

    connectionData.sequelize.query(`SELECT * FROM product WHERE idProduct = :_idProduct`,
    {replacements:{_idProduct: idProduct}, type: connectionData.sequelize.QueryTypes.SELECT})
    .then((queryresult) => {
        let notId = idValidation(idProduct, queryresult);
        if(notId){
            res.status(404);
            res.send("The ID product does not exist in database, please enter a valid ID.");
        }else{
            if(!attribute || !value){
                res.status(400);
                res.send("Invalid data. Please check that both query strings (attribute, value) exist and are spelled correctly.");
            }else{
                if(attribute === "dish"){
                    connectionData.sequelize.query(`SELECT dish FROM product WHERE dish = :_dish`,
                    {replacements:{_dish: value}, type: connectionData.sequelize.QueryTypes.SELECT})
                    .then((queryresult) => {
                        if(queryresult.length != 0){
                            res.status(409);
                            res.send(`The update of the dish of ID ${idProduct} is not possible because the dish already exists in another id. Please change the dish.`);
                        }else{
                            let dishLowerCase = value.toLowerCase();
                            // The following line allows to simulate the "capitalize" function of CSS in JS, only for the first letter
                            let dishCapitalize = dishLowerCase.charAt(0).toUpperCase()+dishLowerCase.slice(1);   

                            connectionData.sequelize.query(`UPDATE product SET ${attribute} = :_value WHERE idProduct = :_idProduct;`,
                            {replacements:{_value: dishCapitalize, _idProduct: idProduct}, type: connectionData.sequelize.QueryTypes.UPDATE})
                            .then((queryresult) => {
                                res.status(200);
                                res.send("Update done.");
                            });
                        };
                    });
                }else if (attribute === "price"){
                    if(isNaN(value)){
                        res.status(400);
                        res.send(`The price update of the ID ${idProduct} is not a number, check the value and make sure it has a point for decimal values.`);
                    }else{
                        connectionData.sequelize.query(`UPDATE product SET ${attribute} = :_value WHERE idProduct = :_idProduct;`,
                            {replacements:{_value: value, _idProduct: idProduct}, type: connectionData.sequelize.QueryTypes.UPDATE})
                            .then((queryresult) => {
                                res.status(200);
                                res.send("Update done.");
                            });
                    };
                }else if (attribute === "image"){
                    connectionData.sequelize.query(`UPDATE product SET ${attribute} = :_value WHERE idProduct = :_idProduct;`,
                            {replacements:{_value: value, _idProduct: idProduct}, type: connectionData.sequelize.QueryTypes.UPDATE})
                            .then((queryresult) => {
                                res.status(200);
                                res.send("Update done.");
                            });
                }else{
                    res.status(404);
                    res.send("The attribute does not exist, please enter an existing attribute such as 'dish', 'price', or 'image'.");
                }
            };
        };
    });
});

/* DELETE - Delete of CRUD ---------------------------------------------------------------------------------------- */

/* Completely remove a product */
serverData.server.delete("/products/:idProduct", middlewareVerifyJwt, middlewareRolAdmin, (req,res) => {
    
    const idProduct = req.params.idProduct;

    connectionData.sequelize.query(`SELECT * FROM product WHERE idProduct = :_idProduct`,
    {replacements:{_idProduct: idProduct}, type: connectionData.sequelize.QueryTypes.SELECT})
    .then((queryresult) => {
        let notId = idValidation(idProduct, queryresult);
        if(notId){
            res.status(404);
            res.send("The ID product does not exist in database, please enter a valid ID.");
        }else{
            connectionData.sequelize.query(`DELETE FROM product WHERE idProduct = :_idProduct`,
            {replacements:{_idProduct: idProduct}, type: connectionData.sequelize.QueryTypes.DELETE})
            .then((queryresult) => {
                res.status(200);
                res.send(`The Id product ${idProduct} has been deleted from database.`);
            });
        };
    });
});