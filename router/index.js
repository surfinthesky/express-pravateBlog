// 含Token 路由
const { log } = require("console");
const express = require("express");
const jwt = require("jsonwebtoken");
const Routers = express.Router();
const fileDisplay = require("../utils/filePath");
// fileDisplay("../public/images/user", (arr) => {
//   console.log(arr, "-=2");
// });

//路由
const fn = require("../model/user");
// console.log(fn,'fn');
let routes = []; // 所有的路由路径存储位置
Object.keys(fn).forEach((key) => {
  routes.push(`${"/" + key}`);
});

const { secretKey } = require("../token/constant");
// 全局验证Token是否合法
const tokens = require("../token/index");

Routers.use(tokens);

// 如果token过期或者 错误的处理
Routers.use(function (err, req, res, next) {
  console.log(err);
  // console.log(req.url, "req");
  // console.log(res);
  console.log("------------");
  if (err.name === "UnauthorizedError") {
    //  这个需要根据自己的业务逻辑来处理（ 具体的err值 请看下面）
    res.status(401).send("token失效");
  }
});

// 验证服务是否开启
Routers.get("/", (req, res) => {
  console.log(res);
  console.log(req.user); //解析token，获取token携带的数据

  res.json({
    code: 0,
    msg: "查询成功",
    data: {
      username: "这是首页",
    },
  });
});

// 获取客户端ip地址
Routers.get("/ip", function (req, res) {
  var clientIp = getIp(req);
  console.log("客户端ip", clientIp);
  res.json({ youIp: clientIp });
});
//通过req的hearers来获取客户端ip
var getIp = function (req) {
  console.log(req);
  var ip =
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddres ||
    req.socket.remoteAddress ||
    "";
  if (ip.split(",").length > 0) {
    ip = ip.split(",")[0];
  }
  return ip;
};
//获取上传的图片
// Routers.get('/getimg', function (request, response) {
//   console.log(request,'request')
//   let params = request.body || request.params;
//   console.log(params,'params')
//   response.sendFile(path.join(__dirname, '../public/images/user/20230207153847googlPassword.jpg48761googlPassword.jpg'));
// })

//注册
Routers.post("/register", (request, response) => {
  let params = request.body || request.params;
  //    数据库操作
  fn.addUser(params).then((result) => {
    console.log(result);
    if (result.message == "注册成功") {
      response.send({
        status: 0,
        message: result.message,
      });
    } else {
      response.send({
        status: 1,
        message: result.message,
      });
    }
  });
});

// 登陆并生成token
Routers.post("/loginperson", (request, response) => {
  let params = request.body || request.params;
  //  数据库操作
  fn.loadUser(params).then((result) => {
    let tokenKey = secretKey; //加密内容
    let token = jwt.sign(params, tokenKey, {
      expiresIn: 60 * 60 * 24, // token时长
    });
    let refreshToken = jwt.sign(params, tokenKey, {
      expiresIn: 60 * 60 * 24 * 7, // token时长
    });
    if (result.length > 0 && result[0].username) {
      response.send({
        status: 1,
        message: "success",
        token: token,
        refreshToken: refreshToken,
        result,
      });
    } else {
      response.send({
        status: 0,
        message: result.message,
      });
    }
  });
});
// 创建文章
Routers.post("/addarticle", (request, response) => {
  let params = request.body || request.params;
  //    数据库操作
  fn.addArticlelist(params).then((result) => {
    if (result) {
      response.send({
        status: 1,
        message: "success",
      });
    } else {
      response.send({
        status: 0,
        message: "error",
      });
    }
  });
});
// 查询文章
Routers.post("/articlepage", (request, response) => {
  let params = request.body || request.params;
  //    数据库操作
  fn.getArticlelist(params).then((result) => {
    if (result) {
      response.send({
        status: 1,
        message: "success",
        count: Number(result[0].count),
        result: result[1],
      });
    } else {
      response.send({
        status: 0,
        message: "error",
      });
    }
  });
});

// 根据id删除文章
Routers.post("/articledelete", (request, response) => {
  let params = request.body || request.params;
  //  数据库操作
  fn.postArticleDelete(params).then((result) => {
    if (result.msg) {
      response.send({
        status: 0,
        message: result.msg,
      });
    } else if (result.affectedRows) {
      response.send({
        status: 1,
        message: "删除成功",
      });
    } else {
      response.send({
        status: 0,
        message: "删除失败",
      });
    }
  });
});
// 文章更新
Routers.post("/articleupdate", (request, response) => {
  let params = request.body || request.params;
  //  数据库操作
  fn.updateArticle(params).then((result) => {
    if (result) {
      response.send({
        status: 1,
        message: "success",
      });
    } else {
      response.send({
        status: 0,
        message: "error",
      });
    }
  });
});
// 文章分类
Routers.post("/articlesort", (request, response) => {
  let params = request.body || request.params;
  //  数据库操作
  fn.articleSort(params).then((result) => {
    if (result) {
      // console.log(result,'result');
      response.send({
        status: 1,
        message: "success",
        result,
      });
    } else {
      response.send({
        status: 0,
        message: "error",
      });
    }
  });
});

// 创建timeline
Routers.post("/addtimeline", (request, response) => {
  let params = request.body || request.params;
  //    数据库操作
  fn.addtimelinelist(params).then((result) => {
    if (result) {
      response.send({
        status: 1,
        message: "success",
      });
    } else {
      response.send({
        status: 0,
        message: "error",
      });
    }
  });
});

// 查询创建timeline
Routers.post("/timelinepage", (request, response) => {
  let params = request.body || request.params;
  //    数据库操作
  fn.getTimelinelist(params).then((result) => {
    if (result) {
      response.send({
        status: 1,
        message: "success",
        count: Number(result[0].count),
        result: result[1],
      });
    } else {
      response.send({
        status: 0,
        message: "error",
      });
    }
  });
});
// timeline更新
Routers.post("/timelineupdate", (request, response) => {
  let params = request.body || request.params;
  //  数据库操作
  fn.updateTimeline(params).then((result) => {
    if (result) {
      response.send({
        status: 1,
        message: "success",
      });
    } else {
      response.send({
        status: 0,
        message: "error",
      });
    }
  });
});
// 根据id删除timeline
Routers.post("/timelinedelete", (request, response) => {
  let params = request.body || request.params;
  //  数据库操作
  fn.timelineDelete(params).then((result) => {
    if (result.msg) {
      response.send({
        status: 0,
        message: result.msg,
      });
    } else if (result.affectedRows) {
      response.send({
        status: 1,
        message: "删除成功",
      });
    } else {
      response.send({
        status: 0,
        message: "删除失败",
      });
    }
  });
});
// 返回存储的图片路径
Routers.get("/allimgPath", (request, response) => {
  let params = request.body || request.params;
  fileDisplay("../public/images/user", (arr) => {
    if (arr) {
      response.send({
        status: 1,
        result: arr,
        message: "success",
      });
    } else {
      response.send({
        status: 0,
        message: "error",
      });
    }
  });
});
//articleHot 前五条
Routers.post("/articleHotlist", (request, response) => {
  let params = request.body || request.params;
  fn.articleHot(params).then((result) => {
    if (result) {
      response.send({
        status: 1,
        message: "success",
        result,
      });
    } else {
      response.send({
        status: 0,
        message: "error",
      });
    }
  });
});
//根据id获取文章
Routers.post("/articledetail", (request, response) => {
  let params = request.body || request.params;
  fn.articleDetail(params).then((result) => {
    if (result) {
      response.send({
        status: 1,
        message: "success",
        result,
      });
    } else {
      response.send({
        status: 0,
        message: "error",
      });
    }
  });
});

module.exports = Routers;
