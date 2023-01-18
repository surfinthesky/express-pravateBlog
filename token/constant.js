
const crypto = require('crypto');

module.exports = {
  MD5_SUFFIX: '10101010',
  md5: (pwd) => {
    let md5 = crypto.createHash('md5');
    return md5.update(pwd).digest('hex');
  },
  secretKey: 'jyr771995_jwttoken'
};