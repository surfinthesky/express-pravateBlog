const CryptoJS = require("crypto-js");
let aseKey = "surf7771995"; //秘钥必须为：8/16/32位
//加密
function crypto_encrypt(payload) {
  return CryptoJS.AES.encrypt(payload, aseKey).toString();
}

//解密
function crypto_decrypt(payload) {
  return CryptoJS.AES.decrypt(payload, aseKey).toString(CryptoJS.enc.Utf8);
}
module.exports = {
  crypto_encrypt,
  crypto_decrypt
};