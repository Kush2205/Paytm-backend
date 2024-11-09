const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const secret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => { 
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    const token = authHeader.split(' ')[1];
    
    try {
        
        const user = jwt.verify(token, secret);
        
        if(user.userid){
            req.userId = user.userid;
            next();
        }
        else{
            return res.status(401).json({message: 'Unauthorized 1'});
        }
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized'});
        
    }
}

module.exports = {authMiddleware};