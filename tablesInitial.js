require('dotenv').config();

const product = {
    createTable:
    `CREATE TABLE IF NOT EXISTS product (
        idProduct INT(4) NOT NULL AUTO_INCREMENT,
        dish VARCHAR(100) NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        image VARCHAR(500) NULL,
        PRIMARY KEY (idProduct)
    )`,
    setValues :
    `INSERT INTO product (dish,price,image)
    VALUES ("Pizzeta",12400,"http://lamonapizza.com/wp-content/uploads/2018/02/carnes.jpg"),("Pizza pequeña",22200,"http://lamonapizza.com/wp-content/uploads/2018/02/bbq.jpg"),("Pizza mediana",31700,"http://lamonapizza.com/wp-content/uploads/2018/02/mixta.jpg"),("Pizza grande",42200,"http://lamonapizza.com/wp-content/uploads/2018/02/vegetales.jpg"),("Spaguetti",14900,"http://lamonapizza.com/wp-content/uploads/2018/02/spaguetii.jpg"),("Lasagna",14900,"http://lamonapizza.com/wp-content/uploads/2018/02/ciciliana.jpg"),("Canelone",15900,"http://lamonapizza.com/wp-content/uploads/2018/02/vegetarianosra.jpg"),("Raviolis",14900,"http://lamonapizza.com/wp-content/uploads/2018/02/raviolis.jpg"),("Fetuccine",14900,"http://lamonapizza.com/wp-content/uploads/2018/02/fetuccini.jpg"),("Marineras",17500,"http://lamonapizza.com/wp-content/uploads/2018/02/fetuccini.jpg"),("Lomitos BBQ",14900,"http://lamonapizza.com/wp-content/uploads/2018/02/15.jpg")`
};

const user = {
    createTable:
    `CREATE TABLE IF NOT EXISTS user (
        idUser INT(4) NOT NULL AUTO_INCREMENT,
        user VARCHAR(255) NOT NULL,
        fullName VARCHAR(255) NOT NULL,
        mail VARCHAR(255) NOT NULL,
        countryIndicator SMALLINT(3) NOT NULL,
        phone VARCHAR(25) NOT NULL,
        adress VARCHAR(500) NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(1) NOT NULL DEFAULT 0 COMMENT '1: Admin\n0: Customer',
        PRIMARY KEY (idUser)
    )`,
    setValues:
    `INSERT INTO user (user,fullName,mail,countryIndicator,phone,adress,password,rol)
    VALUES ("admin","Cristian Celis","celiscristian1304@gmail.com",57,3115217587,"calle 25G #74B-50","U2FsdGVkX1+ZqEcg6UIzVZQR5i05LdB/7oB9EjjFWEM=",1),("lcruz13","Laura Cruz","lcruz1798@gmail.com",57,3023259883,"calle 100 esperanza","U2FsdGVkX1+Rj2hOgRfLaDIhZkUeY6S6pE9vK0eyjFk=",0),("jsecelisp","José Celis","josecelisp@gmail.com",57,3107961200,"calle falsa 123","U2FsdGVkX19olCrQAd7PkrpbKgj6pWtnAEC+ZpPIbl4=",0)`
};

const order = {
    createTable:
    `CREATE TABLE IF NOT EXISTS ${process.env.DB_NAME}.order (
        idOrder INT NOT NULL AUTO_INCREMENT,
        idUser INT NOT NULL,
        status VARCHAR(1) NOT NULL DEFAULT 'N' COMMENT 'N: New\nC: Confirmed\nP: Preparing\nS: Sending\nX: Canceled\nD: Delivered',
        methodPayment VARCHAR(2) NOT NULL COMMENT 'C: Cash\nCD: Credit or Debit Card\n ',
        total DECIMAL(15,2) NOT NULL,
        deliveryAddress VARCHAR(255) NOT NULL,
        date DATETIME NOT NULL,
        PRIMARY KEY (idOrder),
        FOREIGN KEY (idUser) REFERENCES user (idUser)
    )`,
    setValues:
    `INSERT INTO ${process.env.DB_NAME}.order (idUser,methodPayment,total,deliveryAddress,date)
    VALUES (2,"C",43200,"calle 100","2021-07-05 13:15:54"),(3,"CD",99300,"km2 bogota-chia","2021-07-05 09:49:12")`
};

const item = {
    createTable:
    `CREATE TABLE IF NOT EXISTS itemOrder (
        idItem INT NOT NULL AUTO_INCREMENT,
        idOrder INT NOT NULL,
        idProduct INT(4) NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        PRIMARY KEY (idItem),
        FOREIGN KEY (idOrder) REFERENCES ${process.env.DB_NAME}.order (idOrder),
        FOREIGN KEY (idProduct) REFERENCES product (idProduct)
    )`,
    setValues:
    `INSERT INTO ${process.env.DB_NAME}.itemOrder (idOrder,idProduct,price)
    VALUES (1,1,12400),(1,5,14900),(1,7,15900),(2,1,12400),(2,4,42200),(2,5,14900),(2,9,14900),(2,11,14900)`
};

tablesInitial = {product,user,order,item};
module.exports = tablesInitial;