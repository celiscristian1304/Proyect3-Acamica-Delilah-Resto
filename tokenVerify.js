const jwt = require('jsonwebtoken');
require('dotenv').config();

function verify(headers){
    const auth = headers.authorization;
    if(!auth){
        return 401;
    }else if(!auth.startsWith("Bearer ")){
        return "Bearer is missing in auth header";
    }else{
        const token = auth.substring(7,auth.length);
        const userInfo = jwt.verify(token,process.env.KEY_JWT,function(err,decoded){
            if(err){
                return err.message;
            }else{
                return jwt.verify(token,process.env.KEY_JWT);
            };
        });
        return userInfo;
    };
};

module.exports = {verify};