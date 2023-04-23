const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
// 配置静态目录
app.use(express.static(path.join(__dirname, "public")));

// 配置body-parser
app.use(
  bodyParser.json({
    limit: "10mb",
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
  })
);

// 配置跨域
app.use(cors());

// 引入index路由文件
const index = require("./router/index");
app.use("/", index);

// 引入index路由文件
const fileupload = require("./router/fileupload");
app.use("/fileupload", fileupload);
app._router.stack.map((item, index) => {
  if (item.handle.stack !== undefined) {
    var outputFilename = "./my.json";
    // fs.writeFile(outputFilename, JSON.stringify(item.handle.stack, null, 4), function(err) {
    //     if(err) {
    //       console.log(err);
    //     } else {
    //       console.log("JSON saved to " + outputFilename);
    //     }
    // });
    // console.log(JSON.stringify(item.handle.stack),'item');
  }
});
//获取所有图片路径

const port = process.env.PORT || 3333;

app.listen(port, (payload) => {
  console.log("开启服务器", port);
});

// /*
//  * ShareWAF 守护进程
//  * 功能：检测ShareWAF工作是否正常，如出现异常：无法访问，则对其进行重启
//  * 本程序可以用forever启动，防止本进程出异常退出，达到双重守护效果
//  */
// process.env.UV_THREADPOOL_SIZE = 128;

// const { exec } = require("child_process");

// /*
//  * 启动ShareWAF
//  */
// function start_sharewaf() {
//   exec("forever start sharewaf.js", (error, stdout, stderr) => {
//     if (error) {
//       console.error(`exec error: ${error}`);
//       return;
//     }
//     console.log(`stdout: ${stdout}`);
//     console.log(`stderr: ${stderr}`);
//   });
// }

// /*
//  * 关闭ShareWAF
//  */
// function stop_sharewaf() {
//   exec("forever stop sharewaf.js", (error, stdout, stderr) => {
//     if (error) {
//       console.error(`exec error: ${error}`);
//       return;
//     }
//     console.log(`stdout: ${stdout}`);
//     console.log(`stderr: ${stderr}`);
//   });
// }

// //启动ShareWAF
// start_sharewaf();

// var request = require("request");

// //sharewaf地址和端口
// var sharewaf_host =
//   // "http://127.0.0.1:" + require("./config.js").shield_port + "/";
//   "http://localhost:3333";
// console.log("sharewaf address:", sharewaf_host);

// //10秒检测一次sharewaf服务是否正常
// setInterval(function () {
//   // console.log('定时任务');
//   //访问sharewaf
//   request.get(sharewaf_host, { timeout: 5000 }, function (err) {
//     if (err != null) {
//       if (
//         err.code == "ETIMEDOUT" ||
//         err.code == "ECONNREFUSED" ||
//         err.code == "ESOCKETTIMEDOUT"
//       ) {
//         console.log('问题');
//         //重启sharewaf
//         stop_sharewaf();
//         start_sharewaf();
//       } else {
//         // console.log("Error:", err.code);
//       }
//     }
//   });
// }, 10000);
