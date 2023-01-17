

# 
## 介绍
node+express编写的api

#### 初始化

```
yarn install
```

###  启动
```
nodemon app.js
```
###  Token说明
#### 1.token过期返回error：
```javascript
{
    "name": "UnauthorizedError",
    "message": "jwt expired",
    "code": "invalid_token",
    "status": 401,
    "inner": {
        "name": "TokenExpiredError",
        "message": "jwt expired",
        "expiredAt": "2023-01-17"
    }
}
```
#### 2.token无效返回error：
```javascript
{
    "name": "UnauthorizedError",
    "message": "invalid signature",
    "code": "invalid_token",
    "status": 401,
    "inner": {
        "name": "JsonWebTokenError",
        "message": "invalid signature"
    }
}
```
####  3.token前端携带
```javascript
Authorization: Bearer 'jyr771995'
```
