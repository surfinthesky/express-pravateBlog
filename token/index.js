const expressJwt = require('express-jwt');
const { secretKey } = require('./constant');//密钥配置文件

const jwtAuth = expressJwt({secret: secretKey}).unless({path:['/load','/loginperson']})
//unless 为排除那些接口 无需进行token验证

module.exports = jwtAuth;