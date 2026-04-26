# School-helper
计算机设计大赛项目

## 作品运行步骤：
1.首先需要下载node.js。如果没有下载，点击后面链接就可跳转到下载界面：https://nodejs.org/zh-cn/download 


2.将作品所有代码保存在同一个文件夹中。


3.在作品文件夹空白处按ctrl + 右键，在弹窗中选择“在此处打开Powershell窗口”。


4.下载需要的前置文件，在命令窗口中输入：npm install express axios 


5.在输入最后的运行代码：node proxy.js


### 如果最后出现：
### ✅ AI助手后端已成功启动！
### ctrl + c 退出
即可表示后端将AI的接口链接成功，如果不显示就表示没有成功链接，按照其报错进行调整即可。


6.双击logig.html文件，在登录窗口下面有初始密码，输入即可进入作品首页界面。

# 🛠 AI 校园助手后端排查与维护指南

本指南旨在帮助开发者快速定位并修复“AI校园助手”后端（Node.js）运行过程中可能出现的各种问题。

---

## 📋 目录
1. [启动与环境报错](#1-启动与环境报错)
2. [文件系统报错](#2-文件系统报错)
3. [讯飞星火-API-调用报错](#3-讯飞星火-api-调用报错)
4. [接口通信与跨域报错](#4-接口通信与跨域报错)
5. [系统防御性优化建议](#5-系统防御性优化建议)

---

## 1. 启动与环境报错

### 症状：`Error: listen EADDRINUSE: address already in use :::3000`
* **原因**：端口 3000 已被其他程序（如之前的调试进程或其他 Node 项目）占用。
* **操作步骤**：
    * **方法 A（修改端口）**：在代码中将 `const PORT = 3000;` 改为 `3001`。
    * **方法 B（关闭占用进程 - Windows）**：
        1. 打开终端输入：`netstat -ano | findstr :3000`
        2. 找到最后一列的 PID 数字。
        3. 执行：`taskkill /F /PID <你的PID>`
    * **方法 C（关闭占用进程 - Mac/Linux）**：
        1. 执行：`lsof -i :3000`
        2. 执行：`kill -9 <PID>`

---

## 2. 文件系统报错

### 症状：控制台显示 `暂时没翻到书，正常回答就好`
* **原因**：程序无法在指定路径找到 `校规手册.txt`。
* **检查清单**：
    1.  **目录结构**：确保主代码文件同级目录下有一个名为 `data` 的文件夹。
    2.  **文件名**：确认文件名完全匹配，包括扩展名（`.txt`）。
    3.  **绝对路径调试**：在 `fs.readFileSync` 之前添加 `console.log("正在尝试读取：", dataPath);`，确认输出的路径在你的电脑中真实存在。

---

## 3. 讯飞星火 API 调用报错

### 症状 A：返回 `401` 或鉴权失败
* **原因**：`API_KEY` 或 `API_SECRET` 填写错误，或账号余额不足。
* **操作步骤**：
    1. 登录 [讯飞开放平台控制台](https://console.xfyun.cn/)。
    2. 重新核对并复制 `APIKey` 和 `APISecret`。
    3. 检查控制台的服务配额，确认 Spark 接口是否有剩余免费额度。

### 症状 B：请求超时 (ETIMEDOUT)
* **原因**：服务器无法访问讯飞的 API 域名。
* **操作步骤**：
    1. 检查网络连接是否正常。
    2. 如果你在公司或学校内网，可能需要配置网络代理，或者尝试切换至手机热点测试。

---

## 4. 接口通信与跨域报错

### 症状 A：浏览器报错 `Access-Control-Allow-Origin`
* **原因**：前端网页所在的域名与后端服务器不一致。
* **操作步骤**：
    * 确保代码中存在 `res.setHeader('Access-Control-Allow-Origin', '*');`。
    * 如果前端需要发送自定义 Header，确保 `Access-Control-Allow-Headers` 中包含了这些字段。

### 症状 B：`SyntaxError: Unexpected token in JSON at position 0`
* **原因**：后端尝试解析空的请求体，或者前端发送的不是标准的 JSON 字符串。
* **操作步骤**：
    1. 在 `let userRequest = JSON.parse(body);` 之前添加 `console.log("收到的原始数据:", body);`。
    2. 检查前端 `fetch` 请求的 `headers` 是否包含了 `'Content-Type': 'application/json'`。

---

## 5. 系统防御性优化建议

为了让后端更稳定，建议在代码中加入以下改进：

1.  **增加 Try-Catch**：
    ```javascript
    try {
        let userRequest = JSON.parse(body);
    } catch (e) {
        res.writeHead(400);
        return res.end("JSON 格式错误");
    }
    ```
2.  **设置超时限制**：
    给 `https.request` 增加 `proxyReq.setTimeout(15000)`，防止因讯飞服务器响应过慢导致你的后端一直挂起。
3.  **完善日志**：
    在关键位置（如读取文件成功、发送请求前、接收响应后）添加 `console.log`，方便在没有调试器的情况下快速定位进度。

---
*指南最后更新日期：2023年10月*
