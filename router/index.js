// 含Token 路由
const express = require("express");
const jwt = require("jsonwebtoken");
const Routers = express.Router();
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
  // console.log(err);
  // console.log(req.url,'req');
  // console.log(res);
  if (err.name === "UnauthorizedError") {
    //  这个需要根据自己的业务逻辑来处理（ 具体的err值 请看下面）
    res.status(401).send("非法token");
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

// 登陆并生成token
Routers.get("/load", (req, res) => {
  let tokenObj = {
    //携带参数
    id: 1,
    username: "小明",
  };
  let tokenKey = secretKey; //加密内容

  let token = jwt.sign(tokenObj, tokenKey, {
    expiresIn: 60 * 60 * 24, // token时长
  });
  res.send({
    code: 0,
    msg: "查询成功",
    token: "Bearer " + token,
    data: {
      username: "12456",
    },
  });
});
// 登陆并生成token
Routers.post("/loginperson", (request, response) => {
  let params = request.body || request.params;
  //    数据库操作
  fn.loadUser(params).then((result) => {
    let tokenKey = secretKey; //加密内容
    let token = jwt.sign(params, tokenKey, {
      expiresIn: 60 * 60 * 24, // token时长
    });
    if (result.length > 0 && result[0].username) {
      response.send({
        status: 1,
        message: "success",
        token: token,
        result,
      });
    } else {
      response.send({
        status: 0,
        message: "error",
        result,
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
// 创建文章 
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
// console.log(Routers.stack,'Routers');
module.exports = Routers;
