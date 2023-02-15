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
    }','${payload.articleNum}'
    )`;
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
  // sys文章更新
  updateArticle: async function (payload) {
    let sql = `UPDATE  ${DatabaseName}.article SET articleTitle ='${payload.articleTitle}',articleDscibe ='${payload.articleDscibe}',articlePic ='${payload.articlePic}',articleDiff ='${payload.articleDiff}',articleDate ='${payload.articleDate}', articleCreatTime ='${payload.articleCreatTime}',articleHtmlText ='${payload.articleHtmlText}',articleNum ='${payload.articleNum}'WHERE ID =${payload.id}`;
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
          count: data[0]["count(id)"],
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
  //   删除文章
  postArticleDelete: async function (payload) {
    let deletesql = `DELETE FROM ${DatabaseName}.article WHERE ID =${payload.delectId}`;
    let isExistence = `SELECT * FROM ${DatabaseName}.article WHERE ID = ${payload.delectId}`;
    return new Promise((resolve, reject) => {
      db.query(isExistence, payload, function (data, err) {
        if (data.length == 0) {
          resolve({ msg: "未查询到该id" });
        } else {
          db.query(deletesql, payload, function (data, err) {
            console.log(data, "data");
            console.log(err, "err");
            if (data) {
              resolve(data);
            } else {
              resolve([]);
            }
          });
        }
      });
    });
  },
  // sys创建timeline
  addtimelinelist: async function (payload) {
    // console.log(payload, "payload");
    let sql = `INSERT INTO ${DatabaseName}.timeline VALUES ('${randomNum(
      8
    )}','${payload.stageContent}','${payload.stageTimestamp}','${
      payload.stageCompletTime
    }','${payload.stageColor}','${payload.stageIcon}'
    )`;
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
  //   获取timeline列表
  getTimelinelist: async function (payload) {
    let sqllist = "SELECT count(id)  FROM myblog.timeline";
    const count = new Promise((resolve, reject) => {
      db.query(sqllist, payload, function (data, err) {
        resolve({
          count: data[0]["count(id)"],
        });
      });
    });
    // 根据articleCreatTime降序排列 DESC降序 ASC升序
    let sql = `select  * from ${DatabaseName}.timeline  order by stageTimestamp DESC limit ${
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
};

module.exports = fn;
