const jwt = require('jsonwebtoken')
//MEAN: Generate Access Token
class MiddleWare{
    static GenerateToken = async (data) => {
        try {
            var token = jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: "1 days", });
            return token;
        } catch (error) {
            throw error;
        }
    };
    static GenerateTokenAdmin = async (data) => {
        try {
            var token = jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: "1 days", });
            return token;
        } catch (error) {
            throw error;
        }
    };
}

module.exports = MiddleWare;