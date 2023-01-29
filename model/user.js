//数据库配置
const db = require("../config/db");
//密码加密解密
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
//表名变量
let DatabaseName = "myblog";
let {
  randomNum
} = require("../utils/randomNum");
const fn = {
  //注册用户  无返回值
  addUser: async function (payload) {
    let sql = `select  passWord from ${DatabaseName}.login  WHERE username =  '${payload.username}'`;
    return new Promise((resolve, reject) => {
      db.query(sql, payload, function (data, err) {
        if (data.length > 0) {
          resolve({
            message: "当前账号名已存在，请更换",
          });
        } else {
          let hashPass = bcrypt.hashSync(payload.password, salt);
          let sql2 = `INSERT INTO  ${DatabaseName}.login VALUES(NULL,'${payload.username}','${hashPass}')`;
          db.query(sql2, payload, function (data, err) {
            if (data.insertId) {
              resolve({
                message: "注册成功",
              });
            } else {
              resolve({
                message: "注册失败,请重新填写注册",
              });
            }
          });

        }
      });
    }).catch(() => {});
  },
  // 登录
  loadUser: async function (payload) {
    let sql = `select  passWord from ${DatabaseName}.login  WHERE username =  '${payload.username}'`;
    return new Promise((resolve, reject) => {
      db.query(sql, payload, function (data, err) {
        let comparehashPass = false;
        if (data.length > 0) {
          comparehashPass = bcrypt.compareSync(
            payload.password,
            data[0].passWord
          );
          if (comparehashPass === true) {
            resolve([{
              username: payload.username,
            }, ]);
          } else {
            resolve({
              message: "密码错误",
            });
          }
        } else {
          resolve({
            message: "账号错误,请重新输入",
          });
        }
      });
    }).catch(() => {});
  },
  // sys创建文章
  addArticlelist: async function (payload) {
    // console.log(payload, "payload");
    let sql = `INSERT INTO ${DatabaseName}.article VALUES ('${randomNum(8)}','${
      payload.articleTitle
    }','${payload.articleDscibe}','${payload.articlePic}','${
      payload.articleDiff
    }','${payload.articleDate}','${payload.articleCreatTime}','${
      payload.articleHtmlText
    }','2'
    )`;
    // let sql = "INSERT INTO ${DatabaseName}.article set ? ";
    // let sql =
    //   "INSERT INTO myblog.article  (id,articleTitle, articleDscibe, articlePic,articleDiff,articleDate,articleCreatTime, articleHtmlText) VALUES (81523018, 'vue基础使用13', 'vue基础使用2', 'vue基础使用3', 'vue', '2023-01-16 00:00:00', '2023-01-16 16:36:55','内容' ";
    console.log(payload, "payload");
    return new Promise((resolve, reject) => {
      db.query(sql, payload, function (data, err) {
        if (data) {
          resolve(data);
        } else {
          resolve([]);
        }
      });
    }).catch(() => {});
  },
  //   获取文章列表
  getArticlelist: async function (payload) {
    let sqllist = "SELECT count(id)  FROM myblog.article";
    const count = new Promise((resolve, reject) => {
      db.query(sqllist, payload, function (data, err) {
        resolve({
          count: data[0]["count(id)"]
        });
      });
    });
    // 根据articleCreatTime降序排列 DESC降序 ASC升序
    let sql = `select  * from ${DatabaseName}.article  order by articleCreatTime DESC limit ${
      (payload.pagenum - 1) * 10
    },${payload.pagesize}`;
    const pageList = new Promise((resolve, reject) => {
      db.query(sql, payload, function (data, err) {
        // console.log(data, "数据");
        resolve(data);
      });
    });
    return Promise.all([count, pageList]).then((values) => {
      // console.log([...values], "values");
      return new Promise((resolve) => {
        resolve(values);
      });
    });
  },
  // sys创建文章
  //   getUserlist: async function (payload) {
  //     let sql =
  //       "select a.*, b.*,a.id as user_id from contacts a inner join user b on a.userlistid = b.id where userid=?";
  //     return new Promise((resolve, reject) => {
  //       db.query(sql, payload, function (data, err) {
  //         resolve(data);
  //       });
  //     });
  //   },
};

module.exports = fn;