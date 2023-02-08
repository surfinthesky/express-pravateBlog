// 无Token 路由
const express = require("express");
const Routers = express.Router();
const moment = require("moment");
const util = require("util");
const path = require("path");
const fs = require("fs");
const sd = require("silly-datetime");
//获取图片等文件
var formidable = require("formidable");

//七牛云配置
const qiniu = require("qiniu");

const accessKey = "surf771995";
const secretKey = "surfinthesky";
const bucket = "maiyatang123";

// 验证服务是否开启
Routers.get("/", (req, res) => {
  console.log(req.user); //解析token，获取token携带的数据

  setTimeout(function () {
    res.json({
      status: 0,
      msg: "查询成功",
      data: {
        username: "这是首页呀",
      },
    });
  }, 500);
});

// 七牛云 Token
Routers.get("/uploadtoken", (req, res) => {
  let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  let options = {
    scope: bucket,
    expires: 3600 * 24,
  };

  let putPolicy = new qiniu.rs.PutPolicy(options);
  let uploadToken = putPolicy.uploadToken(mac);

  setTimeout(function () {
    res.json({
      status: 0,
      msg: "查询成功",
      data: {
        username: "这是首页呀",
        uploadToken: uploadToken,
      },
    });
  }, 2000);
});

// 七牛云 上传
Routers.post("/upload", (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, filesa) {
    // console.log(filesa.file);
    let MathRoundNumber = Math.round(Math.random() * 100000);
    let MathRound = moment().format("YYYY_MM_DD_hh_mm_ss");
    let key = MathRound + MathRoundNumber + filesa.file.type;
    let path = filesa.file.path;
    console.log(path, "path");

    let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    let options = {
      scope: bucket,
      expires: 3600 * 24,
    };

    let putPolicy = new qiniu.rs.PutPolicy(options);
    let uploadToken = putPolicy.uploadToken(mac);

    uploadFile(uploadToken, key, path)
      .then((idea) => {
        console.log("上传成功");
        res.json({
          status: 0,
          msg: "上传成功",
          data: {
            url: "http://img.baidu.top/" + idea.key,
          },
        });
      })
      .catch((err) => {
        //其实这种情况 也上传了图片,为了严禁起见
        console.log(err.key, "key");
        if (err.key) {
          res.json({
            status: 4,
            msg: "上传失败",
            data: {
              url: "http://img.baidu.top" + err.key,
            },
          });
        } else {
          res.json({
            status: 4,
            msg: "上传失败",
            data: {
              url: "",
            },
          });
        }
      });

    //构造上传函数
    async function uploadFile(uptoken, key, localFile) {
      var config = new qiniu.conf.Config();
      // 空间对应的机房
      config.zone = qiniu.zone.Zone_z0;
      var formUploader = new qiniu.form_up.FormUploader(config);
      var putExtra = new qiniu.form_up.PutExtra();
      return new Promise((resolve, reject) => {
        // 文件上传
        formUploader.putFile(
          uptoken,
          key,
          localFile,
          putExtra,
          function (respErr, respBody, respInfo) {
            if (respErr) {
              throw respErr;
            }
            if (respInfo.statusCode == 200) {
              resolve(respBody);
            } else {
              reject(respBody); //其实这种情况 也上传了图片,为了严禁起见
            }
          }
        );
      });
    }
  });
});

// 上传保存图片的接口
Routers.post("/profile", (request, response) => {
  let form = new formidable.IncomingForm();
  form.uploadDir = "./public/images/user"; // 定义图片上传到的目录public>>images>>user
  form.keepExtensions = true;
  form.parse(request, function (err, fields, files) {
    if (err) return response.redirect(303, "/error");
    //   console.log(req);
    console.log(
      "上传的图片信息",
      util.inspect({ fields: fields, files: files })
    ); //打印解析出的信息，方便后续读取
    if (files.file.name == "" && files.file.size == 0) {
      //判断前端是否传了图片，如果没有，向前端返回数据，并return
      response.json({
        status: 0,
        msg: "请上传图片",
      });
      return;
    }
    // 根据原文件名+当前时间戳+随机数生成新文件名
    p = path.resolve(__dirname, ".."); //获取当前文件（upload.js）的上一级文件的位置，用于后续
    let ttt = sd.format(new Date(), "YYYYMMDDHHmmss");
    let ran = parseInt(Math.random() * 89999 + 10000); //生成随机数
    let extname = files.file.path.split("public\\images\\user\\")[1]; //从解析的表单中获取图片文件上传后的文件名(上传后在public文件夹下的名称)
    let originalFilename = files.file.name; //从解析的表单中获取图片文件的源文件名(上传前在本地的名称)
    let oldpath = p + "\\" + files.file.path; //p + 上传后的文件位置，记得使用转义符连接，得到现在的图片文件地址
    let newpath = path.resolve(oldpath, "..") + "\\" + ttt + extname; //现在的图片文件地址的上一级地址+拼接后的新的文件名，得到新的图片文件地址
    // 保存新的图片地址，用于稍后往数据库写入，由于在数据库中存储图片地址的字符串，此处需要使用多次转义符
    let finalpath = "http://localhost:3333" + "/images/user/" + ttt + extname;
    // console.log(oldpath, "oldpath");
    // console.log(newpath, "newpath");
    // console.log("\/images\/user\/"+ ttt + extname,'需要的')
    //使用fs.rename对图片进行重命名
    fs.rename(oldpath, newpath, function (err) {
      if (err) {
        // 重命名失败，向前端返回数据
        response.json({
          status: 0,
          msg: "错误",
        });
        throw Error("改名失败");
      } else {
        // 重命名成功，向保存图片地址到数据库
        response.json({
          status: 1,
          path: finalpath,
          msg: "没事多吃溜溜梅",
        });
        return;
        pool.getConnection(function (err, connection) {
          var $sql5 = `UPDATE userinfo set photo="${newpath}" where userinfo_id=${req.session.loginUser.userid}`; //sql语句，根据业务需求进行修改
          connection.query($sql5, function (err, result) {
            console.log($sql5, err, result);
            if (err) {
              response.json({
                status: -1,
                msg: "错误",
              });
            } else if (result.affectedRows == 1) {
              // 图片保存成功，向前端返回数据
              result = {
                status: 1,
                msg: "上传成功",
              };
            } else {
              // 图片保存失败，向前端返回数据
              result = {
                status: -1,
                msg: "错误",
              };
            }
            response.json(result);
          });
        });
      }
    });
  });
});

module.exports = Routers;
