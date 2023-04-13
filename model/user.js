//数据库配置
const db = require("../config/db");
//密码加密解密
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
//表名变量
let DatabaseName = "myblog";
// 随机数
let { randomNum } = require("../utils/randomNum");
let { crypto_decrypt } = require("../utils/crypto");
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
    let string = ",";
    let sql = `select * from ${DatabaseName}.login  WHERE username =  '${payload.username}'`;
    console.log(sql, "sql");
    return new Promise((resolve, reject) => {
      db.query(sql, payload, function (data, err) {
        let comparehashPass = false;
        if (data.length > 0) {
          //校验密码
          comparehashPass = bcrypt.compareSync(
            crypto_decrypt(payload.password),
            data[0].password
          );
          if (comparehashPass === true) {
            resolve([
              {
                username: payload.username,
                avatarurl: data[0].avatarurl,
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
    let sqllist = "";
    let sql = "";
    if (payload.sortvalue) {
      sqllist = `SELECT count(id) FROM ${DatabaseName}.article  WHERE  articleDiff  ='${payload.sortvalue}'`;
      sql = `SELECT *  FROM ${DatabaseName}.article  WHERE  articleDiff  = '${
        payload.sortvalue
      }' order by articleCreatTime DESC limit ${(payload.pagenum - 1) * 10},${
        payload.pagesize
      }`;
    } else {
      sqllist = "SELECT count(id)  FROM myblog.article";
      sql = `select  * from ${DatabaseName}.article  order by articleCreatTime DESC limit ${
        (payload.pagenum - 1) * 10
      },${payload.pagesize}`;
    }

    const count = new Promise((resolve, reject) => {
      db.query(sqllist, payload, function (data, err) {
        // console.log(data, "总数量----");
        resolve({
          count: data[0]["count(id)"],
        });
      });
    });
    // 根据articleCreatTime降序排列 DESC降序 ASC升序

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
    console.log(payload.pagenum, "payload");
    let sqllist = "SELECT count(id)  FROM myblog.timeline";
    const count = new Promise((resolve, reject) => {
      db.query(sqllist, payload, function (data, err) {
        resolve({
          count: data[0]["count(id)"],
        });
      });
    });
    // 根据articleCreatTime降序排列 DESC降序 ASC升序
    let sql = "";
    if (!payload.pagenum) {
      sql = `select  *  from ${DatabaseName}.timeline  order by stageCompletTime DESC `;
    } else {
      sql = `select  * from ${DatabaseName}.timeline  order by stageTimestamp DESC limit ${
        (payload.pagenum - 1) * 10
      },${payload.pagesize}`;
    }
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
  // sys timeline更新
  updateTimeline: async function (payload) {
    let sql = `UPDATE  ${DatabaseName}.timeline SET stageContent ='${payload.stageContent}',stageTimestamp ='${payload.stageTimestamp}',stageCompletTime ='${payload.stageCompletTime}',stageColor ='${payload.stageColor}',stageIcon ='${payload.stageIcon}' WHERE ID =${payload.id}`;
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
  //  根据id删除timeline
  timelineDelete: async function (payload) {
    let deletesql = `DELETE FROM ${DatabaseName}.timeline WHERE ID =${payload.delectId}`;
    let isExistence = `SELECT * FROM ${DatabaseName}.timeline WHERE ID = ${payload.delectId}`;
    return new Promise((resolve, reject) => {
      db.query(isExistence, payload, function (data, err) {
        console.log(data, "123");
        if (data.length == 0) {
          resolve({ msg: "未查询到该id" });
        } else {
          db.query(deletesql, payload, function (data, err) {
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
  //  文章分类articleDiff
  // SELECT COUNT(articleDiff),articleDiff(key) FROM article GROUP BY articleDiff
  // { COUNT(articleDiff):3  articleDiff: React}
  articleSort: async function (payload) {
    let sql = `SELECT COUNT(${payload.sortText}),articleDiff FROM ${DatabaseName}.article GROUP BY ${payload.sortText}`;
    return new Promise((resolve, reject) => {
      db.query(sql, payload, function (data, err) {
        if (data) {
          let arr = [];
          data.map((item) => {
            let obj = {
              count: "",
              articleDiff: "",
            };
            obj.count = item["COUNT(articleDiff)"];
            obj.articleDiff = item.articleDiff;
            arr.push(obj);
          });
          resolve(arr);
        } else {
          resolve([]);
        }
      });
    });
  },

  //  热门文章阅读量前5
  // SELECT id,articleTitle,articleNum FROM article GROUP BY id,articleTitle ORDER BY articleNum  DESC LIMIT 0,5
  articleHot: async function (payload) {
    let sql = `SELECT id,articleTitle,articleNum FROM ${DatabaseName}.article GROUP BY id,articleTitle ORDER BY articleNum  DESC LIMIT 0,5`;
    return new Promise((resolve, reject) => {
      db.query(sql, payload, function (data, err) {
        if (data) {
          resolve(data);
        } else {
          resolve([]);
        }
      });
    });
  },
  //根据id获取文章
  articleDetail: async function (payload) {
    let sql = `SELECT * FROM ${DatabaseName}.article WHERE ID =${payload.id}`;
    return new Promise((resolve, reject) => {
      db.query(sql, payload, function (data, err) {
        if (data) {
          resolve(data);
        } else {
          resolve([]);
        }
      });
    });
  },

  //留言接口  WHERE ISNULL(toCommentId)
  replyMessgae: async function (payload) {
    let countsql = `SELECT COUNT(id) FROM ${DatabaseName}.commentInfo WHERE  ISNULL(toCommentId) `;
    let parentsql = `SELECT * FROM ${DatabaseName}.commentInfo    WHERE ISNULL(toCommentId)  ORDER BY createDate DESC LIMIT ${
      (payload.pagenum - 1) * 10
    },${payload.pagesize}`;
    let childsql = `SELECT * FROM ${DatabaseName}.commentInfo WHERE toCommentId is not null ORDER BY createDate DESC`;
    const count = await new Promise((resolve, reject) => {
      db.query(countsql, payload, function (data, err) {
        resolve({
          count: Number(data[0]["COUNT(id)"]),
        });
      });
    });
    const pageList = await new Promise((resolve, reject) => {
      db.query(parentsql, payload, function (data, err) {
        if (data) {
          resolve(data);
          // let infoObj = {};
          // let userinfodata = [];
          // data.map((item) => {
          //   let findUser = `SELECT * FROM ${DatabaseName}.login WHERE ID = ${item.userId}`;
          //   db.query(findUser, payload, function (data, err) {
          //     infoObj.id = data[0].id;
          //     infoObj.username = data[0].username;
          //     infoObj.avatarurl = data[0].avatarurl;
          //     item.userinfo = infoObj;
          //     userinfodata.push(item);
          //     resolve(userinfodata);
          //   });
          // });
        } else {
          resolve([]);
        }
      });
    });
    const childpageList = new Promise((resolve, reject) => {
      db.query(childsql, payload, function (data, err) {
        if (data) {
          resolve(data);
        } else {
          resolve([]);
        }
      });
    });
    return Promise.all([count, pageList, childpageList]).then((values) => {
      // console.log(values, "values2");
      return new Promise((resolve) => {
        resolve(values);
      });
    });
  },

  // 根据id获取用户信息
  getuserInfo: async function (payload) {
    let sql = `SELECT  id,username,avatarurl   FROM ${DatabaseName}.login  WHERE  ID   = ${payload.id}`;
    return new Promise((resolve, reject) => {
      db.query(sql, payload, function (data, err) {
        if (data) {
          resolve(data);
        } else {
          resolve([]);
        }
      });
    });
  },
  // 用户添加评论
  insertMessage: async function (payload) {
    let sql = "";
    if (payload.isFirstLevel == 0) {
      sql = `INSERT INTO ${DatabaseName}.commentInfo VALUES (${payload.id},${payload.commentUser.id},NULL,NULL,${payload.isFirstLevel},'${payload.content}','${payload.createDate}')`;
      console.log(sql, "sql");
    } else {
      sql = `INSERT INTO ${DatabaseName}.commentInfo VALUES (${payload.id},${payload.commentUser.id},${payload.targetUser.userId},${payload.parentId},${payload.isFirstLevel},'${payload.content}','${payload.createDate}')`;
      console.log(sql, "sql2");
    }
    return new Promise((resolve, reject) => {
      db.query(sql, payload, function (data, err) {
        if (data) {
          console.log(data, "添加评论");
          resolve(data);
        } else {
          resolve([]);
        }
      });
    });
  },
};

module.exports = fn;
