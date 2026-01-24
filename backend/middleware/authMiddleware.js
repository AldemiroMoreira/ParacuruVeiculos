const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const secretKey = process.env.JWT_SECRET || 'paracuru_secret_key_change_me';
        const decoded = jwt.verify(token, secretKey);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};
