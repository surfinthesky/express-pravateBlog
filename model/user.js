//数据库配置
const db = require("../config/db");
//密码加密解密
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
//表名变量
let DatabaseName = "myblog";
let { randomNum } = require("../utils/randomNum");
const fn = {
  //注册用户  无返回值
  addUser: async function (data) {
    let sql = "insert into user(username,password,email) values(?,?,?)";
    let arr = [];
    arr.push(data.username);
    arr.push(data.password);
    arr.push(data.email);
    return await db.query(sql, arr);
  },

  // // 登录
  // loadUser: async function (data) {
  // 	let sql = "select * from user where email=?"
  // 	let arr = []
  // 	arr.push(data)

  // 	return new Promise((resolve, reject) => {
  // 		db.query(sql, arr, function (data, err) {
  // 			resolve(data)
  // 		})
  // 	})
  // 	return await db.query(sql,arr)
  // },
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
            resolve([
              {
                username: payload.username,
              },
            ]);
          } else {
            resolve({
              message: "密码错误",
            });
          }
        } else {
          resolve({
            message: "账号错误",
          });
        }
      });
    }).catch(() => {});
  },
  // sys创建文章
  addArticlelist: async function (payload) {
    console.log(payload, "payload");
    let sql = `INSERT INTO ${DatabaseName}.article VALUES ('${randomNum(8)}','${
      payload.articleTitle
    }','${payload.articleDscibe}','${payload.articlePic}','${
      payload.articleDiff
    }','${payload.articleDate}','${payload.articleCreatTime}','${
      payload.articleHtmlText
    }')`;
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
    let sql2 = "SELECT count(id)  FROM myblog.article";
    const count = new Promise((resolve, reject) => {
      db.query(sql2, payload, function (data, err) {
        // console.log(data[0]["count(id)"], "count");
		resolve(data[0]["count(id)"])
      });
    });
    let sql = `select  * from ${DatabaseName}.article  limit ${payload.pagenum},${payload.pagesize}`;
    console.log(sql, "sql");
    const pageList = new Promise((resolve, reject) => {
      db.query(sql, payload, function (data, err) {
        // console.log(data, "数据");
		resolve(data)
      });
    });
    Promise.all([count, pageList]).then((values) => {
      console.log([...values], "values");
	  return values
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
